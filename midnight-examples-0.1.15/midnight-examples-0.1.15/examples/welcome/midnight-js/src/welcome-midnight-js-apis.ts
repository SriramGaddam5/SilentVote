import {
  AppProviders,
  WelcomeContract,
  WelcomeProviders,
  DeployedWelcomeContract,
  FinalizedWelcomeCallTxData,
} from './common-types.js';
import { CallTxFailedError, deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import {
  Contract,
  WelcomePrivateState,
  createOrganizerWelcomePrivateState,
  createParticipantWelcomePrivateState,
  ledger,
  witnesses,
  Ledger,
  INITIAL_PARTICIPANTS_VECTOR_LENGTH,
  Maybe,
  pureCircuits,
} from '@midnight-ntwrk/welcome-contract';
import { ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { FinalizedTxData } from '@midnight-ntwrk/midnight-js-types';
import {
  Action,
  ActionHistory,
  ActionId,
  Actions,
  AsyncActionStates,
  OrganizerWelcomeAPI,
  OrganizerWelcomeState,
  ParticipantWelcomeAPI,
  ParticipantWelcomeState,
} from '@midnight-ntwrk/welcome-api';
import * as Rx from 'rxjs';
import { deriveOrganizerWelcomeState } from './derive-organizer-welcome-state.js';
import { EphemeralState } from './ephemeral-state-bloc.js';
import { deriveParticipantWelcomeState } from './derive-participant-welcome-state.js';
import { prettifyLedgerState, prettifyOrganizerState, prettifyParticipantState } from './prettify-utils.js';

export const welcomeContractInstance: WelcomeContract = new Contract(witnesses);

export const getWelcomePrivateState = (providers: WelcomeProviders): Promise<WelcomePrivateState | null> =>
  providers.privateStateProvider.get('welcomePrivateState');

const getOrganizerSecretKey = async (providers: WelcomeProviders): Promise<Uint8Array> => {
  const privateState = await getWelcomePrivateState(providers);
  if (privateState === null) {
    throw new Error('Unexpected undefined private state');
  }
  if (privateState.organizerSecretKey === null) {
    throw new Error('Unexpected undefined secret key');
  }
  return privateState.organizerSecretKey;
};

const buildAndSubmitCallTx = (
  appProviders: AppProviders,
  action: Action,
  submitTx: () => Promise<FinalizedWelcomeCallTxData>,
): Promise<ActionId> => {
  const actionId = appProviders.crypto.randomUUID();
  void Rx.firstValueFrom(
    appProviders.ephemeralStateBloc
      .addAction({
        action,
        status: AsyncActionStates.inProgress,
        startedAt: new Date(),
        id: actionId,
      })
      .pipe(
        Rx.tap(() => appProviders.logger.info({ submittingTransaction: action })),
        Rx.concatMap(() => submitTx()),
        Rx.tap((finalizedTxData) =>
          appProviders.logger.info({
            transactionFinalized: {
              circuitId: action,
              status: finalizedTxData.public.status,
              txId: finalizedTxData.public.txId,
              txHash: finalizedTxData.public.txHash,
              blockHeight: finalizedTxData.public.blockHeight,
            },
          }),
        ),
        Rx.concatMap((finalizedTxData) => appProviders.ephemeralStateBloc.succeedAction(actionId, finalizedTxData.public)),
        Rx.catchError((error: Error) =>
          appProviders.ephemeralStateBloc.failAction(
            actionId,
            error.message,
            error instanceof CallTxFailedError ? error.finalizedTxData : undefined,
          ),
        ),
      ),
  );
  return Promise.resolve(actionId);
};

const actionHistoriesEqual = (a: ActionHistory, b: ActionHistory): boolean =>
  a.latest === b.latest &&
  Object.keys(a.all).length === Object.keys(b.all).length &&
  Object.keys(a.all).every((key) => key in b.all && a.all[key].status === b.all[key].status);

const organizerStatesEqual = (a: OrganizerWelcomeState, b: OrganizerWelcomeState): boolean =>
  a.secretKey === b.secretKey && a.publicKey === b.publicKey && a.role === b.role && actionHistoriesEqual(a.actions, b.actions);

const createStateObservable = <W extends OrganizerWelcomeState | ParticipantWelcomeState>(
  providers: WelcomeProviders,
  appProviders: AppProviders,
  contractAddress: ContractAddress,
  derivation: (ledgerState: Ledger, privateState: WelcomePrivateState, ephemeralState: EphemeralState) => W,
  equals: (a: W, b: W) => boolean,
  prettify: (w: W) => object,
): Rx.Observable<W> => {
  return Rx.combineLatest(
    [
      providers.publicDataProvider.contractStateObservable(contractAddress, { type: 'latest' }).pipe(
        Rx.map((contractState) => ledger(contractState.data)),
        Rx.tap((ledgerState) => {
          appProviders.logger.info({ ledgerState: prettifyLedgerState(ledgerState) });
        }),
      ),
      Rx.from(getWelcomePrivateState(providers)).pipe(
        Rx.concatMap((existingPrivateState) =>
          providers.privateStateProvider.state$('welcomePrivateState').pipe(
            Rx.startWith(existingPrivateState),
            Rx.filter((privateState): privateState is WelcomePrivateState => privateState !== null),
          ),
        ),
      ),
      appProviders.ephemeralStateBloc.state$,
    ],
    derivation,
  ).pipe(
    Rx.distinctUntilChanged(equals),
    Rx.tap((w) => appProviders.logger.info({ localState: prettify(w) })),
    Rx.shareReplay({ bufferSize: 1, refCount: true }),
  );
};

export const createParticipantsMaybeVector = (initialParticipants: string[]): Maybe<string>[] =>
  initialParticipants
    .map((p) => ({
      is_some: true,
      value: p,
    }))
    .concat(
      Array(INITIAL_PARTICIPANTS_VECTOR_LENGTH - initialParticipants.length).fill({
        is_some: false,
        value: '',
      }),
    );

// TODO: extract deploy and join functions that work for organizer and participant APIs.
export class OrganizerWelcomeMidnightJSAPI implements OrganizerWelcomeAPI {
  static async deploy(
    providers: WelcomeProviders,
    appProviders: AppProviders,
    initialParticipants: string[],
  ): Promise<OrganizerWelcomeMidnightJSAPI> {
    const deployedContract = await deployContract(providers, {
      privateStateKey: 'welcomePrivateState',
      contract: welcomeContractInstance,
      initialPrivateState: createOrganizerWelcomePrivateState(appProviders.crypto.randomSk()),
      args: [createParticipantsMaybeVector(initialParticipants)],
    });
    appProviders.logger.info({
      contractDeployed: {
        address: deployedContract.deployTxData.public.contractAddress,
        block: deployedContract.deployTxData.public.blockHeight,
      },
    });
    const secretKey = await getOrganizerSecretKey(providers);
    return new OrganizerWelcomeMidnightJSAPI(deployedContract, providers, appProviders, secretKey);
  }

  static async join(
    providers: WelcomeProviders,
    appProviders: AppProviders,
    contractAddress: ContractAddress,
  ): Promise<OrganizerWelcomeMidnightJSAPI> {
    const existingPrivateState = await getWelcomePrivateState(providers);
    const deployedContract = await findDeployedContract(providers, {
      contractAddress,
      contract: welcomeContractInstance,
      privateStateKey: 'welcomePrivateState',
      initialPrivateState: existingPrivateState || createOrganizerWelcomePrivateState(appProviders.crypto.randomSk()),
    });
    appProviders.logger.info({
      contractJoined: {
        address: deployedContract.deployTxData.public.contractAddress,
      },
    });
    const secretKey = await getOrganizerSecretKey(providers);
    return new OrganizerWelcomeMidnightJSAPI(deployedContract, providers, appProviders, secretKey);
  }

  readonly contractAddress: ContractAddress;
  readonly finalizedDeployTxData: FinalizedTxData;
  readonly initialLedgerState: Ledger;
  readonly publicKey: Uint8Array;
  readonly state$: Rx.Observable<OrganizerWelcomeState>;

  constructor(
    private readonly deployedContract: DeployedWelcomeContract,
    private readonly providers: WelcomeProviders,
    private readonly appProviders: AppProviders,
    readonly secretKey: Uint8Array,
  ) {
    this.contractAddress = deployedContract.deployTxData.public.contractAddress;
    this.finalizedDeployTxData = (({ tx, status, txHash, txId, blockHash, blockHeight }) => ({
      tx,
      status,
      txHash,
      txId,
      blockHash,
      blockHeight,
    }))(deployedContract.deployTxData.public);
    this.initialLedgerState = ledger(deployedContract.deployTxData.public.initialContractState.data);
    this.publicKey = pureCircuits.public_key(secretKey);
    this.state$ = createStateObservable(
      this.providers,
      this.appProviders,
      this.contractAddress,
      deriveOrganizerWelcomeState,
      organizerStatesEqual,
      prettifyOrganizerState,
    );
  }

  addParticipant(participantId: string): Promise<ActionId> {
    return buildAndSubmitCallTx(this.appProviders, Actions.addParticipant, () =>
      this.deployedContract.callTx.add_participant(participantId),
    );
  }

  addOrganizer(organizerPk: Uint8Array): Promise<ActionId> {
    return buildAndSubmitCallTx(this.appProviders, Actions.addOrganizer, () =>
      this.deployedContract.callTx.add_organizer(organizerPk),
    );
  }
}

const participantStatesEqual = (a: ParticipantWelcomeState, b: ParticipantWelcomeState): boolean =>
  a.participantId === b.participantId && a.isCheckedIn === b.isCheckedIn && actionHistoriesEqual(a.actions, b.actions);

export class ParticipantWelcomeMidnightJSAPI implements ParticipantWelcomeAPI {
  static async join(
    providers: WelcomeProviders,
    appProviders: AppProviders,
    contractAddress: ContractAddress,
  ): Promise<ParticipantWelcomeMidnightJSAPI> {
    appProviders.logger.info({ joiningContract: contractAddress });
    const existingPrivateState = await getWelcomePrivateState(providers);
    const deployedContract = await findDeployedContract(providers, {
      contractAddress,
      contract: welcomeContractInstance,
      privateStateKey: 'welcomePrivateState',
      initialPrivateState: existingPrivateState || createParticipantWelcomePrivateState(),
    });
    appProviders.logger.info({
      contractJoined: {
        address: deployedContract.deployTxData.public.contractAddress,
      },
    });
    return new ParticipantWelcomeMidnightJSAPI(deployedContract, providers, appProviders);
  }

  readonly contractAddress: ContractAddress;
  readonly state$: Rx.Observable<ParticipantWelcomeState>;

  constructor(
    private readonly deployedContract: DeployedWelcomeContract,
    private readonly providers: WelcomeProviders,
    private readonly appProviders: AppProviders,
  ) {
    this.contractAddress = deployedContract.deployTxData.public.contractAddress;
    this.state$ = createStateObservable(
      this.providers,
      this.appProviders,
      this.contractAddress,
      deriveParticipantWelcomeState,
      participantStatesEqual,
      prettifyParticipantState,
    );
  }

  checkIn(participantId: string): Promise<ActionId> {
    return buildAndSubmitCallTx(this.appProviders, Actions.checkIn, () => this.deployedContract.callTx.check_in(participantId));
  }
}
