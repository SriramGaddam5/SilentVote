import { Contract, Witnesses, Ledger, ledger, pureCircuits } from '../managed/welcome/contract/index.cjs';
import {
  createOrganizerWelcomePrivateState,
  createParticipantWelcomePrivateState,
  WelcomePrivateState,
  witnesses,
} from '../witnesses.js';
import * as crypto from 'node:crypto';
import {
  CircuitContext,
  CircuitResults,
  constructorContext,
  QueryContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';

type WelcomeContract = Contract<WelcomePrivateState, Witnesses<WelcomePrivateState>>;

export const randomSk = () => crypto.getRandomValues(Buffer.alloc(32));

export const randomOrganizerWelcomePrivateState = () => createOrganizerWelcomePrivateState(randomSk());

export const toHex = (byteArray: Uint8Array): string => Buffer.from(byteArray).toString('hex');

const INITIAL_PARTICIPANTS_VECTOR_LENGTH = 5000;

// Adapted from the '@midnight/coracle-contract' tests
export class WelcomeSimulator {
  readonly contract: WelcomeContract;
  userPrivateStates: Record<string, WelcomePrivateState>;
  circuitContext: CircuitContext<WelcomePrivateState>;
  turnContext: CircuitContext<WelcomePrivateState>;
  updateUserPrivateState: (newPrivateState: WelcomePrivateState) => void;

  constructor(deployerName: string, deployerInitialPrivateState: WelcomePrivateState, initialParticipants: string[]) {
    this.contract = new Contract(witnesses);
    const emptyMaybeVector = Array(INITIAL_PARTICIPANTS_VECTOR_LENGTH - initialParticipants.length).fill({
      is_some: false,
      value: '',
    });
    const participantMaybeVector = initialParticipants
      .map((p) => ({
        is_some: true,
        value: p,
      }))
      .concat(emptyMaybeVector);
    const { currentPrivateState, currentContractState, currentZswapLocalState } = this.contract.initialState(
      constructorContext(deployerInitialPrivateState, '0'.repeat(64)),
      participantMaybeVector,
    );
    this.userPrivateStates = { [deployerName]: currentPrivateState };
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(currentContractState.data, sampleContractAddress()),
    };
    this.turnContext = { ...this.circuitContext };
    this.updateUserPrivateState = (newPrivateState: WelcomePrivateState) => {
      this.userPrivateStates[deployerName] = newPrivateState;
    };
  }

  static organizerDeploy(organizerName: string, initialParticipants: string[] = []): WelcomeSimulator {
    return new WelcomeSimulator(organizerName, randomOrganizerWelcomePrivateState(), initialParticipants);
  }

  private buildTurnContext(currentPrivateState: WelcomePrivateState): CircuitContext<WelcomePrivateState> {
    return {
      ...this.circuitContext,
      currentPrivateState,
    };
  }

  organizerJoin(organizerName: string): WelcomePrivateState {
    const organizerPrivateState = randomOrganizerWelcomePrivateState();
    this.turnContext = this.buildTurnContext(organizerPrivateState);
    this.updateUserPrivateStateByName(organizerName)(organizerPrivateState);
    this.updateUserPrivateState = this.updateUserPrivateStateByName(organizerName);
    return organizerPrivateState;
  }

  organizerPk(organizerName: string): Uint8Array {
    if (organizerName in this.userPrivateStates) {
      const organizerPrivateState = this.userPrivateStates[organizerName];
      if (organizerPrivateState.organizerSecretKey !== null) {
        return pureCircuits.public_key(organizerPrivateState.organizerSecretKey);
      }
      throw new Error(`${organizerName} is not an organizer`);
    }
    throw new Error(`${organizerName} is not a user`);
  }

  participantJoin(participantName: string): WelcomePrivateState {
    const participantPrivateState = createParticipantWelcomePrivateState();
    this.turnContext = this.buildTurnContext(participantPrivateState);
    this.updateUserPrivateStateByName(participantName)(participantPrivateState);
    this.updateUserPrivateState = this.updateUserPrivateStateByName(participantName);
    return participantPrivateState;
  }

  getLedgerState(): Ledger {
    return ledger(this.circuitContext.transactionContext.state);
  }

  getPrivateState(name: string): WelcomePrivateState {
    return this.userPrivateStates[name];
  }

  private updateUserPrivateStateByName =
    (name: string) =>
    (newPrivateState: WelcomePrivateState): void => {
      this.userPrivateStates[name] = newPrivateState;
    };

  as(name: string): WelcomeSimulator {
    this.turnContext = this.buildTurnContext(this.userPrivateStates[name]);
    this.updateUserPrivateState = this.updateUserPrivateStateByName(name);
    return this;
  }

  private updateStateAndGetLedger<T>(circuitResults: CircuitResults<WelcomePrivateState, T>): Ledger {
    this.circuitContext = circuitResults.context;
    this.updateUserPrivateState(circuitResults.context.currentPrivateState);
    return this.getLedgerState();
  }

  addOrganizer(organizerPk: Uint8Array): Ledger {
    return this.updateStateAndGetLedger(this.contract.impureCircuits.add_organizer(this.turnContext, organizerPk));
  }

  // transitions functions
  addParticipant(participantId: string): Ledger {
    return this.updateStateAndGetLedger(this.contract.impureCircuits.add_participant(this.turnContext, participantId));
  }

  checkIn(participantId: string): Ledger {
    return this.updateStateAndGetLedger(this.contract.impureCircuits.check_in(this.turnContext, participantId));
  }
}
