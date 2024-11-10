import { Logger } from 'pino';
import { AppProviders, WelcomeCircuitKeys, WelcomeProviders } from '../common-types';
import { EphemeralStateBloc } from '../ephemeral-state-bloc';
import { Config } from './initialize-welcome';
import { Resource, pipe } from '@midnight-ntwrk/welcome-helpers';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { SubscribablePrivateStateProviderDecorator } from '../private-state-decorator';
import { inMemoryPrivateStateProvider } from './in-memory-private-state-provider';
import { headlessWalletAndMidnightProvider } from './headless-wallet-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { webCryptoCryptography } from '../cryptography';
import { webcrypto } from 'node:crypto';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { Wallet } from '@midnight-ntwrk/wallet-api';
import * as Rx from 'rxjs';
import { nativeToken } from '@midnight-ntwrk/ledger';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

const waitForFunds = (wallet: Wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.filter((balance) => balance > 0n),
    ),
  );

export const initializeWallet = (
  { indexer, indexerWS, proofServer, node }: Config,
  logger: Logger,
  seed: string,
): Resource<Wallet> =>
  Resource.make(
    async () => {
      const wallet = await WalletBuilder.buildFromSeed(indexer, indexerWS, proofServer, node, seed, getZswapNetworkId(), 'warn');
      wallet.start();
      const state = await Rx.firstValueFrom(wallet.state());
      logger.info(`Wallet seed is: ${seed}`);
      logger.info(`Wallet address is: ${state.address}`);
      let balance = state.balances[nativeToken()];
      if (balance === undefined || balance === 0n) {
        logger.info(`Wallet balance is: 0`);
        logger.info(`Waiting to receive tokens...`);
        balance = await waitForFunds(wallet);
      }
      logger.info(`Wallet balance is: ${balance}`);
      return wallet;
    },
    (wallet) => wallet.close(),
  );

export const initializeProviders = (logger: Logger, config: Config, seed: string): Resource<[WelcomeProviders, AppProviders]> => {
  return pipe(
    EphemeralStateBloc.init(logger.child({ entity: 'ephemeral state provider' })),
    Resource.zip(initializeWallet(config, logger, seed)),
    Resource.mapAsync(async ([ephemeralStateBloc, wallet]) => {
      const midnightWalletProvider = await headlessWalletAndMidnightProvider(wallet);
      const publicDataProvider = indexerPublicDataProvider(config.indexer, config.indexerWS);
      const privateStateProvider = new SubscribablePrivateStateProviderDecorator(logger, inMemoryPrivateStateProvider());
      const zkConfigProvider = new NodeZkConfigProvider<WelcomeCircuitKeys>(config.zkConfigPath);
      const proofProvider = httpClientProofProvider<WelcomeCircuitKeys>(config.proofServer);
      logger.info('started providers');
      const welcomeProviders = {
        midnightProvider: midnightWalletProvider,
        walletProvider: midnightWalletProvider,
        publicDataProvider,
        privateStateProvider,
        zkConfigProvider,
        proofProvider,
      };
      const appProviders = {
        logger,
        ephemeralStateBloc,
        crypto: webCryptoCryptography(webcrypto as Crypto),
      };
      return [welcomeProviders, appProviders];
    }),
  );
};

export const withNewEphemeralStateProvider = async (name: string, appProviders: AppProviders): Promise<AppProviders> => {
  const newEphemeralStateBloc = await EphemeralStateBloc.init(
    appProviders.logger.child({ entity: `${name}-ephemeral-state-provider` }),
  )
    .allocate()
    .then((a) => a.value);
  return { ...appProviders, ephemeralStateBloc: newEphemeralStateBloc };
};

export const withNewPrivateStateProvider = (providers: WelcomeProviders, appProviders: AppProviders): WelcomeProviders => ({
  ...providers,
  privateStateProvider: new SubscribablePrivateStateProviderDecorator(appProviders.logger, inMemoryPrivateStateProvider()),
});

export const withNewProviders = async (
  name: string,
  providers: WelcomeProviders,
  appProviders: AppProviders,
): Promise<[WelcomeProviders, AppProviders]> => {
  return [withNewPrivateStateProvider(providers, appProviders), await withNewEphemeralStateProvider(name, appProviders)];
};
