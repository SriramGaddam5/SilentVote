import { WelcomePrivateState, Ledger, pureCircuits } from '@midnight-ntwrk/welcome-contract';
import { OrganizerWelcomeState, Roles } from '@midnight-ntwrk/welcome-api';
import { EphemeralState } from './ephemeral-state-bloc.js';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';

export const deriveOrganizerWelcomeState = (
  { organizerPks }: Ledger,
  { organizerSecretKey }: WelcomePrivateState,
  { actions }: EphemeralState,
): OrganizerWelcomeState => {
  if (organizerSecretKey === null) {
    throw new Error('unexpected null secret key');
  }
  const publicKey = pureCircuits.public_key(organizerSecretKey);
  return {
    actions,
    role: organizerPks.member(publicKey) ? Roles.organizer : Roles.spectator,
    publicKey: toHex(publicKey),
    secretKey: toHex(organizerSecretKey),
  };
};
