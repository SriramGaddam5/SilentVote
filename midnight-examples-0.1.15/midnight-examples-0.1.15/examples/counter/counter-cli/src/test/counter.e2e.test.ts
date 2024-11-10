import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../logger-utils';
import { currentDir, StandaloneConfig } from '../config';
import { LocalTestConfig, parseArgs, type TestConfiguration } from './commons';

const FILE_NAME = fileURLToPath(import.meta.url);
const DIR_NAME = path.dirname(FILE_NAME);

const logDir = path.resolve(currentDir, '..', 'logs', 'tests', `${new Date().toISOString()}.log`);
const logger = await createLogger(logDir);

describe('E2E Counter CLI', () => {
  let testConfig: TestConfiguration;

  beforeAll(() => {
    if (process.env.RUN_ENV_TESTS !== undefined) {
      testConfig = parseArgs(['seed', 'entry']);
    } else {
      testConfig = new LocalTestConfig();
    }
    logger.info(`Test environment: ${testConfig.entrypoint}`);
    logger.info(`Test wallet seed: ${testConfig.seed}`);
  });

  it('should deploy the contract and increment the counter [@slow]', async () => {
    const steps = [
      {
        input: 'Build wallet from a seed',
        answer: '2',
        condition: (nextInput: string) => {
          return nextInput.includes('Enter your wallet seed');
        },
      },
      {
        input: 'Enter your wallet seed',
        answer: testConfig.seed,
        condition: (nextInput: string) => {
          return nextInput.includes('Your wallet balance is');
        },
      },
      {
        input: 'Deploy a new counter contract',
        answer: '1',
        condition: (nextInput: string) => {
          return true;
        },
      },
      {
        input: 'Display current counter value',
        answer: '2',
        condition: (nextInput: string) => {
          return nextInput.includes('Current counter value: 0');
        },
      },
      {
        input: 'Increment',
        answer: '1',
        condition: (nextInput: string) => {
          return nextInput.includes('Incrementing');
        },
      },
      {
        input: 'Display current counter value',
        answer: '2',
        condition: (nextInput: string) => {
          return nextInput.includes('Current counter value: 1');
        },
      },
      {
        input: 'Exit',
        answer: '3',
      },
    ];

    let progressCondition: ((input: string) => boolean) | undefined;

    const cliProcess = spawn(
      'npx',
      ['ts-node', '--esm', '--experimental-specifier-resolution=node', testConfig.entrypoint],
      {
        cwd: DIR_NAME,
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );

    const promise = new Promise<void>((resolve: (value: PromiseLike<void> | void) => void) => {
      if (testConfig.dappConfig instanceof StandaloneConfig) {
        // There is a skip of asking for wallet in this scenario
        steps.shift();
        steps.shift();
      }
      let step = steps.shift();
      cliProcess?.stdout?.on('data', (data: Buffer) => {
        logger.info(`STEP[Wait for input='${step?.input}', to answer='${step?.answer}']`);
        const output = data.toString();
        logger.info(`[CONSOLE] ${output.trim()}`);
        expect(output).not.toContain('ERROR');
        if (progressCondition !== undefined && progressCondition(output)) {
          step = steps.shift();
          progressCondition = undefined;
        }
        if (steps.length === 0) {
          resolve();
        }
        if (step !== undefined && output.includes(step.input)) {
          cliProcess?.stdin?.write(`${step.answer}\n`);
          progressCondition = step.condition;
          logger.info(
            `Will progress to next step on condition: ${progressCondition?.toString().replaceAll(/\s+/g, ' ')}`,
          );
        }
      });
      cliProcess?.stderr?.on('data', (err: string) => {
        resolve(Promise.reject(err.toString()));
      });
      cliProcess?.on('error', (err: string) => {
        resolve(Promise.reject(err.toString()));
      });
      cliProcess?.on('exit', (code: number) => {
        expect(code).toBe(0);
        cliProcess?.kill('SIGKILL');
        resolve();
      });
    });
    await expect(promise).resolves.toBeUndefined();
  });
});
