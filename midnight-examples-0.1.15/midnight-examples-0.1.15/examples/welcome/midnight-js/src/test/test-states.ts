import {
  Action,
  AsyncAction,
  AsyncActionState,
  OrganizerWelcomeState,
  ParticipantWelcomeState,
} from '@midnight-ntwrk/welcome-api';
import { Ledger } from '@midnight-ntwrk/welcome-contract';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';

type TestAction = { action: Action; status: AsyncActionState };

export const testActionsEqual = (actualLastAction: AsyncAction | null, expectedLastAction: TestAction | null): boolean => {
  if (actualLastAction === null && expectedLastAction === null) {
    return true;
  } else if (actualLastAction !== null && expectedLastAction !== null) {
    return actualLastAction.action === expectedLastAction.action && actualLastAction.status === expectedLastAction.status;
  } else {
    return false;
  }
};

export type TestParticipantWelcomeState = Omit<ParticipantWelcomeState, 'actions'> & {
  latestAction: TestAction | null;
};

export const createTestParticipantWelcomeState = (
  participantId: string | null,
  isCheckedIn: boolean,
  latestAction: TestAction | null,
): TestParticipantWelcomeState => ({
  participantId,
  isCheckedIn,
  latestAction,
});

export const testParticipantWelcomeStatesEqual = (a: ParticipantWelcomeState, b: TestParticipantWelcomeState): boolean =>
  a.participantId === b.participantId &&
  a.isCheckedIn === b.isCheckedIn &&
  testActionsEqual(a.actions.latest === null ? null : a.actions.all[a.actions.latest], b.latestAction);

export type TestOrganizerWelcomeState = Omit<OrganizerWelcomeState, 'actions'> & {
  latestAction: TestAction | null;
};

export const createTestOrganizerWelcomeState = (
  secretKey: Uint8Array,
  publicKey: Uint8Array,
  role: 'organizer' | 'spectator',
  latestAction: TestAction | null,
): TestOrganizerWelcomeState => ({ secretKey: toHex(secretKey), publicKey: toHex(publicKey), role, latestAction });

export const testOrganizerWelcomeStatesEqual = (a: OrganizerWelcomeState, b: TestOrganizerWelcomeState): boolean =>
  a.role === b.role &&
  a.secretKey === b.secretKey &&
  a.publicKey === b.publicKey &&
  testActionsEqual(a.actions.latest === null ? null : a.actions.all[a.actions.latest], b.latestAction);

export type TestLedger = {
  organizerPks: Uint8Array[];
  checkedInParticipants: string[];
  eligibleParticipants: string[];
};

export const createTestLedgerState = (
  organizerPks: Uint8Array[] = [],
  checkedInParticipants: string[] = [],
  eligibleParticipants: string[] = [],
): TestLedger => ({
  organizerPks,
  checkedInParticipants,
  eligibleParticipants,
});

export const setsEqual = <A>(as: Set<A>, bs: Set<A>) => as.size === bs.size && [...as].every((x) => bs.has(x));

export const testLedgerStatesEqual = (a: Ledger, b: TestLedger): boolean =>
  setsEqual(new Set([...a.organizerPks].map(toHex)), new Set(b.organizerPks.map(toHex))) &&
  setsEqual(new Set(a.checkedInParticipants), new Set(b.checkedInParticipants)) &&
  setsEqual(new Set(a.eligibleParticipants), new Set(b.eligibleParticipants));
