import * as path from 'path';
import { StartedDockerComposeEnvironment } from 'testcontainers';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import type { Logger } from 'pino';
import { pipe, Resource } from '@midnight-ntwrk/welcome-helpers';
import { DockerServicePorts } from './initialize-welcome';

const DEFAULT_STARTUP_TIMEOUT = 30_000;
const DEFAULT_SHUTDOWN_TIMEOUT = 10_000;

export const initializeContainers = (logger: Logger): Resource<DockerServicePorts> => {
  return pipe(
    Resource.make(
      async () => {
        const env = new DockerComposeEnvironment(
          path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../'),
          'test-compose.yml',
        )
          .withWaitStrategy('welcome-proof-server', Wait.forListeningPorts())
          .withWaitStrategy('welcome-indexer', Wait.forListeningPorts())
          .withStartupTimeout(DEFAULT_STARTUP_TIMEOUT);
        logger.info('Starting containers...');
        return await env.up();
      },
      async (env: StartedDockerComposeEnvironment) => {
        logger.info('Stopping containers...');
        await env.down({ timeout: DEFAULT_SHUTDOWN_TIMEOUT, removeVolumes: true });
      },
    ),
    Resource.map((startedComposeEnv) => ({
      // Per the test compose file, host ports are chosen at random and mapped to the container ports specified in the compose file.
      // This avoids port clashes when Welcome tests are run concurrently.
      // The object below retrieves the randomly chosen host ports, so they can be passed to the other providers.
      proofServer: startedComposeEnv.getContainer('welcome-proof-server').getMappedPort(6300),
      indexer: startedComposeEnv.getContainer('welcome-indexer').getMappedPort(8088),
      node: startedComposeEnv.getContainer('welcome-node').getMappedPort(9944),
    })),
  );
};
