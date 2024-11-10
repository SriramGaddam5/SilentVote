import { Ledger, Maybe } from './managed/welcome/contract/index.cjs';
import { WitnessContext } from '@midnight-ntwrk/compact-runtime';

export type WelcomePrivateState = {
  readonly organizerSecretKey: Uint8Array | null;
  readonly participantId: string | null;
};

export const createOrganizerWelcomePrivateState = (organizerSecretKey: Uint8Array) => ({
  organizerSecretKey,
  participantId: null,
});

export const createParticipantWelcomePrivateState = () => ({
  organizerSecretKey: null,
  participantId: null,
});

export const witnesses = {
  local_sk: ({ privateState }: WitnessContext<Ledger, WelcomePrivateState>): [WelcomePrivateState, Maybe<Uint8Array>] => [
    privateState,
    privateState.organizerSecretKey
      ? { is_some: true, value: privateState.organizerSecretKey }
      : { is_some: false, value: Buffer.alloc(32) },
  ],
  set_local_id: (
    { privateState }: WitnessContext<Ledger, WelcomePrivateState>,
    participantId: string,
  ): [WelcomePrivateState, void] => [{ ...privateState, participantId }, undefined],
};
