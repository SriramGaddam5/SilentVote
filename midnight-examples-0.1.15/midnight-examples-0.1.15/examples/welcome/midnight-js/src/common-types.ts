import { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { Cryptography } from './cryptography.js';
import { Logger } from 'pino';
import { Witnesses, WelcomePrivateState, Contract } from '@midnight-ntwrk/welcome-contract';
import { SubscribablePrivateStateProvider } from './private-state-decorator.js';
import { FoundContract, FinalizedCallTxData } from '@midnight-ntwrk/midnight-js-contracts';
import { EphemeralStateBloc } from './ephemeral-state-bloc.js';

export type PrivateStates = {
  welcomePrivateState: WelcomePrivateState;
};

export type WelcomeContract = Contract<WelcomePrivateState, Witnesses<WelcomePrivateState>>;

export type WelcomeCircuitKeys = Exclude<keyof WelcomeContract['impureCircuits'], number | symbol>;

export type WelcomeProviders = MidnightProviders<WelcomeCircuitKeys, PrivateStates> & {
  privateStateProvider: SubscribablePrivateStateProvider<PrivateStates>;
};

export type AppProviders = {
  crypto: Cryptography;
  logger: Logger;
  ephemeralStateBloc: EphemeralStateBloc;
};

export type DeployedWelcomeContract = FoundContract<WelcomePrivateState, WelcomeContract>;

export type FinalizedWelcomeCallTxData = FinalizedCallTxData<WelcomePrivateState, WelcomeContract, WelcomeCircuitKeys>;
