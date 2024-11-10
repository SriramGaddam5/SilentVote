import { createContext, type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Actions, type ParticipantWelcomeState, AsyncActionStates, type ActionId } from '@midnight-ntwrk/welcome-api';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import {
  ParticipantWelcomeMidnightJSAPI,
  EphemeralStateBloc,
  SubscribablePrivateStateProviderDecorator,
  unsafeCryptography,
} from '@midnight-ntwrk/welcome-midnight-js';
import type { DAppConnectorAPI, DAppConnectorWalletAPI, ServiceUriConfig } from '@midnight-ntwrk/dapp-connector-api';
import '@midnight-ntwrk/dapp-connector-api';
import { type Logger } from 'pino';
import { useErrorContext } from '../hooks';
import { type AppProviders, type WelcomeProviders } from '@midnight-ntwrk/welcome-midnight-js';
import { pipe, Resource } from '@midnight-ntwrk/welcome-helpers';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import {
  type BalancedTransaction,
  createBalancedTx,
  type UnbalancedTransaction,
} from '@midnight-ntwrk/midnight-js-types';
import { type CoinInfo, Transaction, type TransactionId } from '@midnight-ntwrk/ledger';
import { concatMap, filter, firstValueFrom, interval, map, of, take, tap, throwError, timeout } from 'rxjs';
import semver from 'semver';
import { WELCOME_CONTRACT_ADDRESS } from '../config/config';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

interface DispatchActionType {
  type: typeof Actions.checkIn;
  payload: string;
}

export interface AppContextTypes {
  isLoading: boolean;
  isClientInitialized: boolean;
  contractAddress: ContractAddress | null;
  state: ParticipantWelcomeState | undefined;
  dispatch: (action: DispatchActionType) => Promise<ActionId | undefined>;
  loadingTitle: string;
}

export const AppContext = createContext<AppContextTypes | undefined>(undefined);

const initializeAPIEntrypoint = (
  logger: Logger,
  wallet: DAppConnectorWalletAPI,
  uris: ServiceUriConfig,
): Promise<APIEntrypoint> =>
  pipe(
    EphemeralStateBloc.init(logger.child({ entity: 'ephemeral-state-stream' })),
    Resource.mapAsync(async (ephemeralStateBloc): Promise<APIEntrypoint> => {
      const walletState = await wallet.state();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return new APIEntrypoint(
        {
          privateStateProvider: new SubscribablePrivateStateProviderDecorator(
            logger.child({
              entity: 'private-state-provider',
            }),
            levelPrivateStateProvider({
              privateStateStoreName: 'welcome-private-state',
            }),
          ),
          zkConfigProvider: new FetchZkConfigProvider(window.location.origin, fetch.bind(window)),
          proofProvider: httpClientProofProvider(uris.proverServerUri),
          publicDataProvider: indexerPublicDataProvider(uris.indexerUri, uris.indexerWsUri),
          walletProvider: {
            coinPublicKey: walletState.coinPublicKey,
            balanceTx(tx: UnbalancedTransaction, newCoins: CoinInfo[]): Promise<BalancedTransaction> {
              return wallet
                .balanceAndProveTransaction(tx, newCoins)
                .then((tx) =>
                  createBalancedTx(Transaction.deserialize(tx.serialize(getZswapNetworkId()), getLedgerNetworkId())),
                );
            },
          },
          midnightProvider: {
            submitTx(tx: BalancedTransaction): Promise<TransactionId> {
              return wallet.submitTransaction(tx);
            },
          },
        },
        {
          logger,
          crypto: unsafeCryptography(),
          ephemeralStateBloc,
        },
      );
    }),
  )
    .allocate()
    .then((a) => a.value);

class APIEntrypoint {
  constructor(
    private readonly providers: WelcomeProviders,
    private readonly appProviders: AppProviders,
  ) {}

  join(address: ContractAddress): Promise<ParticipantWelcomeMidnightJSAPI> {
    return ParticipantWelcomeMidnightJSAPI.join(this.providers, this.appProviders, address);
  }
}

export const AppProvider = ({ children, logger }: { children: ReactNode; logger: Logger }): ReactElement => {
  const [state, setState] = useState<ParticipantWelcomeState>();
  const [api, setAPI] = useState<ParticipantWelcomeMidnightJSAPI | null>(null);
  const [contractAddress, setContractAddress] = useState<ContractAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState('');
  const [isClientInitialized, setIsClientInitialized] = useState(false);

  const { errorMessage, setErrorMessage } = useErrorContext();

  const navigate = useNavigate();
  const location = useLocation();

  const subscribeToParticipantWelcomeState = (participantWelcomeAPI: ParticipantWelcomeMidnightJSAPI): void => {
    participantWelcomeAPI.state$.subscribe({
      next: (state: ParticipantWelcomeState) => {
        setState(state);
      },
      error: (error) => {
        logger.error(error);
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Unexpected error in state stream');
        }
      },
    });
  };

  const connectToWallet = (): Promise<{ wallet: DAppConnectorWalletAPI; uris: ServiceUriConfig }> => {
    const compatibleConnectorAPIVersion = '1.x';
    return firstValueFrom(
      pipe(
        interval(100),
        map(() => window.midnight?.mnLace),
        tap((maybeLace) => {
          logger.info('Checking that wallet is present...', maybeLace);
        }),
        filter((maybeAPI: DAppConnectorAPI | undefined): maybeAPI is DAppConnectorAPI => maybeAPI !== undefined),
        concatMap((api) =>
          semver.satisfies(api.apiVersion, compatibleConnectorAPIVersion)
            ? of(api)
            : throwError(() => new Error(`expected ${compatibleConnectorAPIVersion}, got ${api.apiVersion}`)),
        ),
        tap((lace) => {
          logger.info('Wallet is present, connecting...', lace);
        }),
        take(1),
        timeout({ first: 1_000, with: () => throwError(() => new Error('Could not find wallet')) }),
        concatMap(async (api) => {
          const isEnabled = await api.isEnabled();
          logger.info('Connection status:', isEnabled);
          return api;
        }),
        timeout({ first: 5_000, with: () => throwError(() => new Error('Wallet does not respond')) }),
        concatMap(async (api: DAppConnectorAPI) => {
          const wallet = await api.enable();
          logger.info('Obtained wallet connection');
          const uris = await api.serviceUriConfig();
          return { wallet, uris };
        }),
      ),
    );
  };

  useEffect(() => {
    logger.info('Initializing Midnight connection');
    setLoadingTitle('Initializing Midnight Connection...');
    setIsLoading(true);
    connectToWallet()
      .then(({ wallet, uris }) => initializeAPIEntrypoint(logger, wallet, uris))
      .then(async (apiEntryPoint) => {
        try {
          setIsLoading(true);
          logger.trace('Calling join on API entrypoint');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const welcomeAPI = await apiEntryPoint.join(WELCOME_CONTRACT_ADDRESS);
          setContractAddress(welcomeAPI.contractAddress);
          setAPI(welcomeAPI);
          subscribeToParticipantWelcomeState(welcomeAPI);
          logger.trace('Subscribed to state stream');
          setIsClientInitialized(true);
        } finally {
          setIsLoading(false);
          setLoadingTitle('');
        }
      })
      .catch((error) => {
        setErrorMessage('Error while initializing, please try again.');
        logger.error('Error while initializing', error);
      });
  }, []);

  useEffect(() => {
    if (state?.actions != null && isLoading) {
      const { latest } = state.actions;
      if (latest != null) {
        const latestAction = state.actions.all[latest];
        if (latestAction.status !== AsyncActionStates.inProgress) {
          setIsLoading(false);
          if (latestAction.status === AsyncActionStates.error) {
            setErrorMessage(latestAction.error);
          }
        }
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
    if (location.pathname !== '/participant-welcome-view' && isClientInitialized) {
      navigate('/participant-welcome-view');
    }
  }, [state, isClientInitialized]);

  const dispatch = async (action: DispatchActionType): Promise<ActionId | undefined> => {
    setIsLoading(true);
    try {
      switch (action.type) {
        case Actions.checkIn: {
          if (api instanceof ParticipantWelcomeMidnightJSAPI) {
            setLoadingTitle('Checking in...');
            return await api.checkIn(action.payload);
          } else {
            setErrorMessage('Unexpected error: API is not initialized');
            return undefined;
          }
        }
        default: {
          setErrorMessage('Unexpected error: invalid action type');
          return undefined;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
        setErrorMessage(error.message);
      } else {
        logger.error(error);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    logger.trace(`isClientInitialized = ${isClientInitialized}`);
  }, [isClientInitialized]);

  useEffect(() => {
    logger.trace(`contractAddress = ${contractAddress}`);
  }, [contractAddress]);

  useEffect(() => {
    logger.trace(`isLoading = ${isLoading}`);
  }, [isLoading]);

  useEffect(() => {
    logger.trace(`loadingTitle = ${loadingTitle}`);
  }, [loadingTitle]);

  useEffect(() => {
    logger.trace(`api = ${api === null ? 'null' : 'midnight-js-api'}`);
  }, [api]);

  useEffect(() => {
    logger.trace(`errorMessage = ${errorMessage}`);
  }, [errorMessage]);

  return (
    <AppContext.Provider value={{ isLoading, loadingTitle, isClientInitialized, state, contractAddress, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
