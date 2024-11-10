import { ActionHistory, OrganizerWelcomeState, ParticipantWelcomeState } from '@midnight-ntwrk/welcome-api';
import { Ledger } from '@midnight-ntwrk/welcome-contract';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';

export const prettifyActions = ({ latest, all }: ActionHistory): object => ({
  latest,
  all: Object.fromEntries(
    Object.entries(all).map(([key, { action, status, startedAt }]) => [key, { action, status, startedAt }]),
  ),
});

export const prettifyOrganizerState = (organizerState: OrganizerWelcomeState) => ({
  ...organizerState,
  actions: prettifyActions(organizerState.actions),
});

export const prettifyParticipantState = (participantState: ParticipantWelcomeState) => ({
  ...participantState,
  actions: prettifyActions(participantState.actions),
});

export const prettifyLedgerState = ({ organizerPks, eligibleParticipants, checkedInParticipants }: Ledger) => ({
  organizerPks: [...organizerPks].map(toHex),
  eligibleParticipants: [...eligibleParticipants],
  checkedInParticipants: [...checkedInParticipants],
});
