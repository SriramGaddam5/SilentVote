import { Ledger, WelcomePrivateState } from '@midnight-ntwrk/welcome-contract';
import { EphemeralState } from './ephemeral-state-bloc.js';
import { ParticipantWelcomeState } from '@midnight-ntwrk/welcome-api';

export const deriveParticipantWelcomeState = (
  { checkedInParticipants }: Ledger,
  { participantId }: WelcomePrivateState,
  { actions }: EphemeralState,
): ParticipantWelcomeState => {
  return participantId === null
    ? {
        actions,
        isCheckedIn: false,
        participantId: null,
      }
    : {
        actions,
        isCheckedIn: checkedInParticipants.member(participantId),
        participantId,
      };
};
