import { describe, beforeAll, afterAll, beforeEach, test, jest } from '@jest/globals';
import { webcrypto } from 'node:crypto';
import { AppProviders, WelcomeProviders } from '../common-types.js';
import { Logger } from 'pino';
import type { Resource } from '@midnight-ntwrk/welcome-helpers';
import { createLogger } from './logger-utils.js';
import path from 'node:path';
import * as Rx from 'rxjs';
import { initializeWelcome } from './initialize-welcome.js';
import { OrganizerWelcomeMidnightJSAPI, ParticipantWelcomeMidnightJSAPI } from '../welcome-midnight-js-apis.js';
import {
  ActionHistory,
  ActionId,
  AsyncAction,
  AsyncActionStates,
  OrganizerWelcomeState,
  ParticipantWelcomeState,
} from '@midnight-ntwrk/welcome-api';
import { WebSocket } from 'ws';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { withNewEphemeralStateProvider, withNewProviders } from './initialize-providers';
import type { TestLedger, TestOrganizerWelcomeState, TestParticipantWelcomeState } from './test-states';
import {
  createTestLedgerState,
  createTestOrganizerWelcomeState,
  createTestParticipantWelcomeState,
  setsEqual,
  testLedgerStatesEqual,
  testOrganizerWelcomeStatesEqual,
  testParticipantWelcomeStatesEqual,
} from './test-states';
import { ledger, Ledger } from '@midnight-ntwrk/welcome-contract';
import { ContractStateObservableConfig } from '@midnight-ntwrk/midnight-js-types';
import { ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { randomInt } from 'crypto';
import { TransactionId } from '@midnight-ntwrk/ledger';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';

// @ts-ignore: It's needed to make Scala.js and WASM code able to use cryptography
globalThis.crypto = webcrypto;

// @ts-ignore: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

setNetworkId(NetworkId.Undeployed);

//Yes, with proving, consensus, etc. longer scenarios take a lot of time
jest.setTimeout(600_000);

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const waitFor = <T>(state$: Rx.Observable<T>, predicate: (t: T) => boolean): Promise<T> =>
  Rx.firstValueFrom(state$.pipe(Rx.filter(predicate), Rx.take(1)));

const waitForCompletion = <S extends { actions: ActionHistory }>(state$: Rx.Observable<S>, actionId: ActionId): Promise<S> => {
  return waitFor(
    state$.pipe(
      Rx.map((state) => {
        const foundError = Object.values(state.actions.all).find(
          (action): action is AsyncAction & { status: 'error' } => action.status === AsyncActionStates.error,
        );
        if (foundError) {
          throw new Error(foundError.error);
        } else {
          return state;
        }
      }),
    ),
    (state) => state.actions.all[actionId].status !== AsyncActionStates.inProgress,
  );
};

type TeardownLogic = () => Promise<void>;

export const expectStates = <A extends object, E extends object>(
  actual$: Rx.Observable<A>,
  expected$: E[],
  equals: (s: A, t: E) => boolean,
): (() => void) => {
  const extraStates: A[] = [];
  const sub = actual$.subscribe({
    next(actual) {
      if (expected$.length === 0) {
        extraStates.push(actual);
      } else {
        const expected = expected$.shift()!;
        if (!equals(actual, expected)) {
          throw new Error(
            `Expected states to be equal.\nActual state: ${JSON.stringify(actual)}\nExpected state: ${JSON.stringify(expected)}`,
          );
        }
      }
    },
  });
  return () => {
    if (extraStates.length > 0) {
      throw new Error(`Extra states: \n${extraStates.map((extra) => JSON.stringify(extra)).join('\n')}`);
    }
    sub.unsubscribe();
  };
};

const expectLedgerStates = (actual$: Rx.Observable<Ledger>, expected: TestLedger[]) =>
  expectStates(actual$, expected, testLedgerStatesEqual);

const expectParticipantWelcomeStates = (
  actual$: Rx.Observable<ParticipantWelcomeState>,
  expected: TestParticipantWelcomeState[],
) => expectStates(actual$, expected, testParticipantWelcomeStatesEqual);

const expectOrganizerWelcomeStates = (actual$: Rx.Observable<OrganizerWelcomeState>, expected: TestOrganizerWelcomeState[]) =>
  expectStates(actual$, expected, testOrganizerWelcomeStatesEqual);

export const runWelcomeTests = (logger: Logger, providersResource: Resource<[WelcomeProviders, AppProviders]>) => {
  describe('contractStateObservable', () => {
    let providers: WelcomeProviders;
    let appProviders: AppProviders;
    let teardownLogic: TeardownLogic;

    beforeAll(async () => {
      const { value, teardown } = await providersResource.allocate();
      [providers, appProviders] = value;
      teardownLogic = teardown;
    });

    beforeEach(async () => {
      const currentTest = expect.getState();
      [providers, appProviders] = await withNewProviders(currentTest.currentTestName ?? 'undefined', providers, appProviders);
    });

    afterAll(async () => {
      await teardownLogic();
    });

    test("'watchForDeployTxData' should work for deploy tx submission", async () => {
      const api = await OrganizerWelcomeMidnightJSAPI.deploy(providers, appProviders, ['jim']);
      const actual = await providers.publicDataProvider.watchForDeployTxData(api.contractAddress);
      const expected = {
        ...api.finalizedDeployTxData,
        tx: expect.anything(), // Ignore the newly added `tx` property for the moment
      };
      return expect(actual).toMatchObject(expected);
    });

    test("'watchForTxData' should work for call tx submission", async () => {
      const api = await OrganizerWelcomeMidnightJSAPI.deploy(providers, appProviders, ['jim']);
      const addAndyId = await api.addParticipant('andy');
      await waitForCompletion(api.state$, addAndyId);
    });

    const ledgerStatesEqual = (a: Ledger, b: Ledger): boolean =>
      setsEqual(new Set(a.eligibleParticipants), new Set(b.eligibleParticipants)) &&
      setsEqual(new Set(a.checkedInParticipants), new Set(b.checkedInParticipants)) &&
      setsEqual(new Set([...a.organizerPks].map(toHex)), new Set([...b.organizerPks].map(toHex)));

    test("'watchForContractState' should work when watch begins after deploy", async () => {
      const api = await OrganizerWelcomeMidnightJSAPI.deploy(providers, appProviders, ['jim']);
      const actual = await providers.publicDataProvider
        .watchForContractState(api.contractAddress)
        .then((contractState) => ledger(contractState.data));
      const expected = api.initialLedgerState;
      return expect(ledgerStatesEqual(actual, expected)).toBe(true);
    });

    test("subscriptions to deployer 'state$' should start with the latest version of organizer welcome state", async () => {
      const api = await OrganizerWelcomeMidnightJSAPI.deploy(providers, appProviders, ['jim']);
      const addParticipantId0 = await api.addParticipant('andy');
      await waitForCompletion(api.state$, addParticipantId0);
      const addParticipantId1 = await api.addParticipant('thomas');
      await waitForCompletion(api.state$, addParticipantId1);
      const unsub = expectOrganizerWelcomeStates(api.state$, [
        createTestOrganizerWelcomeState(api.secretKey, api.publicKey, 'organizer', {
          action: 'add_participant',
          status: 'success',
        }),
      ]);
      // to ensure no lagging states arrive
      await sleep(10000);
      unsub();
    });

    test('organizers can join and rejoin without replaying the entire state history', async () => {
      const deployerAPI = await OrganizerWelcomeMidnightJSAPI.deploy(providers, appProviders, ['jim']);

      const addParticipantId = await deployerAPI.addParticipant('andy');
      await waitForCompletion(deployerAPI.state$, addParticipantId);

      const [joinedOrganizerProviders, joinedOrganizerAppProviders] = await withNewProviders(
        'joined-organizer',
        providers,
        appProviders,
      );
      const joinedOrganizerAPI = await OrganizerWelcomeMidnightJSAPI.join(
        joinedOrganizerProviders,
        joinedOrganizerAppProviders,
        deployerAPI.contractAddress,
      );

      const joinedOrganizerExpectedFirstState = createTestOrganizerWelcomeState(
        joinedOrganizerAPI.secretKey,
        joinedOrganizerAPI.publicKey,
        'spectator',
        null,
      );
      const joinedOrganizerExpectedSecondState = createTestOrganizerWelcomeState(
        joinedOrganizerAPI.secretKey,
        joinedOrganizerAPI.publicKey,
        'organizer',
        null,
      );
      const unsub0 = expectOrganizerWelcomeStates(joinedOrganizerAPI.state$, [
        joinedOrganizerExpectedFirstState,
        joinedOrganizerExpectedSecondState,
      ]);

      const addOrganizerId = await deployerAPI.addOrganizer(joinedOrganizerAPI.publicKey);
      await waitForCompletion(deployerAPI.state$, addOrganizerId);
      await sleep(10000);
      unsub0();

      // We create a new ephemeral state provider to simulate the user refreshing/revisiting the application web page.
      // This clears the action history.
      const rejoinedOrganizerAppProviders = await withNewEphemeralStateProvider(
        'rejoined-organizer',
        joinedOrganizerAppProviders,
      );
      const rejoinedOrganizerAPI = await OrganizerWelcomeMidnightJSAPI.join(
        joinedOrganizerProviders,
        rejoinedOrganizerAppProviders,
        deployerAPI.contractAddress,
      );
      const rejoinedOrganizerExpectedFirstState = createTestOrganizerWelcomeState(
        joinedOrganizerAPI.secretKey,
        joinedOrganizerAPI.publicKey,
        'organizer',
        null,
      );

      const unsub1 = expectOrganizerWelcomeStates(rejoinedOrganizerAPI.state$, [rejoinedOrganizerExpectedFirstState]);
      await sleep(10000);
      unsub1();

      const [participantProviders, participantAppProviders] = await withNewProviders(
        'joined-participant',
        providers,
        appProviders,
      );
      const joinedParticipantAPI = await ParticipantWelcomeMidnightJSAPI.join(
        participantProviders,
        participantAppProviders,
        deployerAPI.contractAddress,
      );

      const joinedParticipantExpectedFirstState = createTestParticipantWelcomeState(null, false, null);
      const unsub2 = expectParticipantWelcomeStates(joinedParticipantAPI.state$, [joinedParticipantExpectedFirstState]);
      await sleep(10000);
      unsub2();

      const checkInId = await joinedParticipantAPI.checkIn('andy');
      await waitForCompletion(joinedParticipantAPI.state$, checkInId);

      const rejoinedParticipantAppProviders = await withNewEphemeralStateProvider(
        'rejoined-participant',
        participantAppProviders,
      );
      const rejoinedParticipantAPI = await ParticipantWelcomeMidnightJSAPI.join(
        participantProviders,
        rejoinedParticipantAppProviders,
        deployerAPI.contractAddress,
      );

      const rejoinedParticipantExpectedFirstState = createTestParticipantWelcomeState('andy', true, null);
      const unsub3 = expectParticipantWelcomeStates(rejoinedParticipantAPI.state$, [rejoinedParticipantExpectedFirstState]);
      await sleep(10000);
      unsub3();
    });

    const prettifyLedgerState = ({ organizerPks, eligibleParticipants, checkedInParticipants }: Ledger) => ({
      organizerPks: [...organizerPks].map(toHex),
      eligibleParticipants: [...eligibleParticipants],
      checkedInParticipants: [...checkedInParticipants],
    });

    const ledgerState$ =
      (providers: WelcomeProviders, appProviders: AppProviders) =>
      (config: ContractStateObservableConfig) =>
      (contractAddress: ContractAddress): Rx.Observable<Ledger> => {
        const streamLogger = appProviders.logger.child({ entity: `ledgerState$-${randomInt(0, 1000)}` });
        return providers.publicDataProvider.contractStateObservable(contractAddress, config).pipe(
          Rx.map((contractState) => ledger(contractState.data)),
          Rx.distinctUntilChanged(ledgerStatesEqual),
          Rx.tap((ledgerState) => streamLogger.info(prettifyLedgerState(ledgerState))),
        );
      };

    test("'contractStateObservable' with 'all' configuration should return all contract states", async () => {
      const deployerAPI = await OrganizerWelcomeMidnightJSAPI.deploy(providers, appProviders, ['jim']);

      const expected0 = createTestLedgerState([deployerAPI.publicKey], [], ['jim']);
      const expected1 = createTestLedgerState([deployerAPI.publicKey], [], ['jim', 'molly']);
      const expected2 = createTestLedgerState([deployerAPI.publicKey], ['molly'], ['jim', 'molly']);
      const unsub0 = expectLedgerStates(ledgerState$(providers, appProviders)({ type: 'all' })(deployerAPI.contractAddress), [
        expected0,
        expected1,
        expected2,
      ]);

      const addMollyId = await deployerAPI.addParticipant('molly');
      await waitForCompletion(deployerAPI.state$, addMollyId);

      const [participantProvider, participantAppProviders] = await withNewProviders('participant', providers, appProviders);
      const participantAPI = await ParticipantWelcomeMidnightJSAPI.join(
        participantProvider,
        participantAppProviders,
        deployerAPI.contractAddress,
      );
      const checkInId = await participantAPI.checkIn('molly');
      await waitForCompletion(participantAPI.state$, checkInId);

      await sleep(5000);
      unsub0();

      const unsub1 = expectLedgerStates(ledgerState$(providers, appProviders)({ type: 'all' })(deployerAPI.contractAddress), [
        expected0,
        expected1,
        expected2,
      ]);
      await sleep(5000);
      unsub1();
    });

    const actionIdToTxId = (actions: ActionHistory, actionId: ActionId): TransactionId => {
      const action = actions.all[actionId];
      if (action === undefined) {
        throw new Error(`Action ${actionId} is undefined`);
      }
      if (action.status === AsyncActionStates.success || action.status === AsyncActionStates.error) {
        if (action.finalizedTxData !== null) {
          return action.finalizedTxData.txId;
        }
      }
      throw new Error(`Action ${JSON.stringify(action)} does not have transaction data associated with it`);
    };

    test("'contractStateObservable' with 'txId' should work", async () => {
      const deployerAPI = await OrganizerWelcomeMidnightJSAPI.deploy(providers, appProviders, ['jim']);

      const addMollyId = await deployerAPI.addParticipant('molly');
      await waitForCompletion(deployerAPI.state$, addMollyId);

      const addAndyId = await deployerAPI.addParticipant('andy');
      await waitForCompletion(deployerAPI.state$, addAndyId);

      const expected0 = createTestLedgerState([deployerAPI.publicKey], [], ['jim', 'molly']);
      const expected1 = createTestLedgerState([deployerAPI.publicKey], [], ['jim', 'molly', 'andy']);

      const ephemeralState = await Rx.firstValueFrom(appProviders.ephemeralStateBloc.state$);

      const addMollyTxId = actionIdToTxId(ephemeralState.actions, addMollyId);
      const unsub0 = expectLedgerStates(
        ledgerState$(providers, appProviders)({ type: 'txId', txId: addMollyTxId, inclusive: true })(deployerAPI.contractAddress),
        [expected0, expected1],
      );
      await sleep(5000);
      unsub0();

      const unsub1 = expectLedgerStates(
        ledgerState$(providers, appProviders)({ type: 'txId', txId: addMollyTxId, inclusive: false })(
          deployerAPI.contractAddress,
        ),
        [expected1],
      );
      await sleep(5000);
      unsub1();
    });
  });
};

const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');
const logDir = path.resolve(currentDir, '..', '..', 'logs', 'tests', `${new Date().toISOString()}.log`);
await createLogger(logDir).then((logger) => runWelcomeTests(logger, initializeWelcome(logger)));
