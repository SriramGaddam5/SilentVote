import { createContext, type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { Actions, type OrganizerWelcomeState, AsyncActionStates, type ActionId } from '@midnight-ntwrk/welcome-api';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import {
  OrganizerWelcomeMidnightJSAPI,
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
import { useLocation, useNavigate } from 'react-router-dom';
import { fromHex } from '@midnight-ntwrk/midnight-js-utils';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

type DispatchActionType =
  | { type: typeof Actions.addParticipant; payload: string }
  | { type: typeof Actions.addOrganizer; payload: string }
  | { type: 'deploy'; payload: string[] }
  | { type: 'join'; payload: ContractAddress };

export interface AppContextTypes {
  isLoading: boolean;
  isClientInitialized: boolean;
  contractAddress: ContractAddress | null;
  state: OrganizerWelcomeState | undefined;
  dispatch: (action: DispatchActionType) => Promise<ActionId | undefined>;
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

  deploy(initialParticipants: string[]): Promise<OrganizerWelcomeMidnightJSAPI> {
    return OrganizerWelcomeMidnightJSAPI.deploy(this.providers, this.appProviders, initialParticipants);
  }

  join(address: ContractAddress): Promise<OrganizerWelcomeMidnightJSAPI> {
    return OrganizerWelcomeMidnightJSAPI.join(this.providers, this.appProviders, address);
  }
}

export const AppProvider = ({ children, logger }: { children: ReactNode; logger: Logger }): ReactElement => {
  const [state, setState] = useState<OrganizerWelcomeState>();
  const [api, setAPI] = useState<OrganizerWelcomeMidnightJSAPI | APIEntrypoint | null>(null);
  const [contractAddress, setContractAddress] = useState<ContractAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClientInitialized, setIsClientInitialized] = useState(false);

  const { setErrorMessage } = useErrorContext();
  const navigate = useNavigate();
  const location = useLocation();

  const subscribeToOrganizerWelcomeState = (organizerWelcomeAPI: OrganizerWelcomeMidnightJSAPI): void => {
    setAPI(organizerWelcomeAPI);
    organizerWelcomeAPI.state$.subscribe({
      next: (state: OrganizerWelcomeState) => {
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

  const JOINED_CONTRACT_ADDRESS_KEY = 'joined-welcome-contract-address';

  const initializeAPI = async (
    logger: Logger,
    wallet: DAppConnectorWalletAPI,
    uris: ServiceUriConfig,
  ): Promise<void> => {
    const maybeExistingJoinAddress = localStorage.getItem(JOINED_CONTRACT_ADDRESS_KEY);
    let api: OrganizerWelcomeMidnightJSAPI | APIEntrypoint = await initializeAPIEntrypoint(logger, wallet, uris);
    if (maybeExistingJoinAddress !== null) {
      api = await initializeWelcomeAPI('join', api, undefined, maybeExistingJoinAddress);
    }
    setAPI(api);
    setIsClientInitialized(true);
  };

  const initializeWelcomeAPI = async (
    type: 'join' | 'deploy',
    apiEntryPoint: APIEntrypoint,
    initialParticipants?: string[],
    contractAddress?: ContractAddress,
  ): Promise<OrganizerWelcomeMidnightJSAPI> => {
    try {
      setIsLoading(true);
      let welcomeAPI;
      if (type === 'join') {
        if (initialParticipants) {
          throw new Error(
            `Bug found: attempted to join and passed initial participants: ${JSON.stringify(initialParticipants)}`,
          );
        }
        if (!contractAddress) {
          throw new Error('Bug found: attempted to join without providing contract address');
        }
        welcomeAPI = await apiEntryPoint.join(contractAddress);
      } else {
        if (!initialParticipants) {
          throw new Error('Bug found: attempted to deploy and passed no initial participants');
        }
        welcomeAPI = await apiEntryPoint.deploy(initialParticipants);
      }
      subscribeToOrganizerWelcomeState(welcomeAPI);
      localStorage.setItem(JOINED_CONTRACT_ADDRESS_KEY, welcomeAPI.contractAddress);
      setContractAddress(welcomeAPI.contractAddress);
      setIsClientInitialized(true);
      return welcomeAPI;
    } finally {
      setIsLoading(false);
    }
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
    connectToWallet()
      .then(({ wallet, uris }) => initializeAPI(logger, wallet, uris))
      .catch((error) => {
        setIsClientInitialized(false);
        setErrorMessage('Error while connecting to Wallet: Wallet not found, unresponsive or connection was rejected');
        logger.error('Error connecting to lace', error);
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
    if (state !== undefined && contractAddress !== null && location.pathname !== '/organizer-welcome-view') {
      navigate('/organizer-welcome-view');
    }
  }, [state]);

  const dispatch = async (action: DispatchActionType): Promise<ActionId | undefined> => {
    setIsLoading(true);
    try {
      switch (action.type) {
        case Actions.addOrganizer: {
          if (api instanceof OrganizerWelcomeMidnightJSAPI) {
            return await api.addOrganizer(fromHex(action.payload));
          } else {
            return undefined;
          }
        }
        case Actions.addParticipant: {
          if (api instanceof OrganizerWelcomeMidnightJSAPI) {
            return await api.addParticipant(action.payload);
          } else {
            return undefined;
          }
        }
        case 'deploy':
          if (api instanceof APIEntrypoint) {
            await initializeWelcomeAPI('deploy', api, action.payload, undefined);
            return;
          } else {
            return undefined;
          }
        case 'join':
          if (api instanceof APIEntrypoint) {
            await initializeWelcomeAPI('join', api, undefined, action.payload);
            return;
          } else {
            return undefined;
          }
        default:
          return 'Action type does not exist';
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error);
      }
    }
  };

  return (
    <AppContext.Provider value={{ isLoading, isClientInitialized, state, contractAddress, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
