import { Logger } from 'pino';
import { Resource, pipe } from '@midnight-ntwrk/welcome-helpers';
import { AppProviders, WelcomeProviders } from '../common-types';
import { initializeProviders } from './initialize-providers';
import { initializeContainers } from './initialize-containers';
import * as path from 'node:path';

export interface DockerServicePorts {
  readonly indexer: number;
  readonly node: number;
  readonly proofServer: number;
}

export interface Config {
  readonly privateStateStoreName: string;
  readonly zkConfigPath: string;
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly proofServer: string;
}

const zkConfigDirectory = '../../../../contract/src/managed/welcome';

export const defaultConfig = (dockerServicePorts: DockerServicePorts) => ({
  privateStateStoreName: 'welcome-private-state',
  zkConfigPath: path.resolve(new URL(import.meta.url).pathname, zkConfigDirectory),
  indexer: `http://localhost:${dockerServicePorts.indexer}/api/v1/graphql`,
  indexerWS: `ws://localhost:${dockerServicePorts.indexer}/api/v1/graphql/ws`,
  node: `http://localhost:${dockerServicePorts.node}`,
  proofServer: `http://localhost:${dockerServicePorts.proofServer}`,
});

const DEFAULT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000042';

export const initializeWelcome = (logger: Logger): Resource<[WelcomeProviders, AppProviders]> => {
  return pipe(
    initializeContainers(logger),
    Resource.flatMap((dockerServicePorts) => initializeProviders(logger, defaultConfig(dockerServicePorts), DEFAULT_WALLET_SEED)),
  );
};
