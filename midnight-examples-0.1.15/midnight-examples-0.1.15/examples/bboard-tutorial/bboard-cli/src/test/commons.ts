import {
  type Config,
  StandaloneConfig,
  TestnetRemoteConfig,
} from '../config';

export interface TestConfig {
  seed: string;
  entrypoint: string;
  dappConfig: Config;
  psMode: string;
}

export class LocalTestConfig implements TestConfig {
  seed = 'hardcoded_in_dApp';
  entrypoint = 'dist/launcher/standalone.js';
  dappConfig = new StandaloneConfig();
  psMode = 'undeployed';
}

export function parseArgs(required: string[]): TestConfig {
  let entry = '';
  if (required.includes('entry')) {
    if (process.env.TEST_ENTRYPOINT !== undefined) {
      entry = process.env.TEST_ENTRYPOINT;
    } else {
      throw new Error('TEST_ENTRYPOINT environment variable is not defined.');
    }
  }

  let seed = '';
  if (required.includes('seed')) {
    if (process.env.TEST_WALLET_SEED !== undefined) {
      seed = process.env.TEST_WALLET_SEED;
    } else {
      throw new Error('TEST_WALLET_SEED environment variable is not defined.');
    }
  }

  let cfg: Config = new TestnetRemoteConfig();
  let env = '';
  let psMode = 'undeployed';
  if (required.includes('env')) {
    if (process.env.TEST_ENV !== undefined) {
      env = process.env.TEST_ENV;
    } else {
      throw new Error('TEST_ENV environment variable is not defined.');
    }
    switch (env) {
      case 'testnet':
        cfg = new TestnetRemoteConfig();
        psMode = 'testnet';
        break;
      default:
        throw new Error(`Unknown env value=${env}`);
    }
  }

  return {
    seed,
    entrypoint: entry,
    dappConfig: cfg,
    psMode,
  };
}
