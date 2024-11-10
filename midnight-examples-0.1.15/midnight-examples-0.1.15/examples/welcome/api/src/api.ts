import * as t from 'io-ts';
import { either } from 'fp-ts';
import { ValuesOf, block } from '@midnight-ntwrk/welcome-helpers';
import { Observable } from 'rxjs';
export const Actions = {
  addParticipant: 'add_participant',
  addOrganizer: 'add_organizer',
  checkIn: 'check_in',
} as const;
export const ActionCodec = t.union([
  t.literal(Actions.addParticipant),
  t.literal(Actions.addOrganizer),
  t.literal(Actions.checkIn),
]);
export type Action = t.TypeOf<typeof ActionCodec>;

export const AsyncActionStates = {
  inProgress: 'in_progress',
  error: 'error',
  success: 'success',
} as const;
export type AsyncActionState = ValuesOf<typeof AsyncActionStates>;

export const ActionIdCodec = t.string;
export type ActionId = t.TypeOf<typeof ActionIdCodec>;

export const DateCodec = t.string.pipe(
  block(() => {
    const validate: t.Validate<string, Date> = (str, context) => {
      const candidate = new Date(str);
      if (candidate.toString() === 'Invalid Date') {
        return either.left([
          {
            value: str,
            context,
            message: `Could not parse ${str} to a Date object`,
          },
        ]);
      } else {
        return either.right(candidate);
      }
    };

    return new t.Type<Date, string, string>(
      'date',
      (value): value is Date => value instanceof Date,
      validate,
      (date) => date.toISOString(),
    );
  }),
);

const AsyncActionCommons = t.type({
  id: ActionIdCodec,
  action: ActionCodec,
  startedAt: DateCodec,
});

export const TxStatuses = {
  failEntirely: 'FailEntirely',
  failFallible: 'FailFallible',
  succeedEntirely: 'SucceedEntirely',
} as const;

export const FinalizedTxDataCodec = t.type({
  txId: t.string,
  status: t.union([
    t.literal(TxStatuses.failEntirely),
    t.literal(TxStatuses.failFallible),
    t.literal(TxStatuses.succeedEntirely),
  ]),
  txHash: t.string,
  blockHeight: t.number,
  blockHash: t.string,
});
export type FinalizedTxData = t.TypeOf<typeof FinalizedTxDataCodec>;

export const AsyncActionCodec = t.intersection([
  AsyncActionCommons,
  t.union([
    t.type({
      status: t.literal(AsyncActionStates.inProgress),
    }),
    t.type({
      status: t.literal(AsyncActionStates.error),
      error: t.string,
      finalizedTxData: t.union([FinalizedTxDataCodec, t.null]),
    }),
    t.type({
      status: t.literal(AsyncActionStates.success),
      finalizedTxData: FinalizedTxDataCodec,
    }),
  ]),
]);
export type AsyncAction = t.TypeOf<typeof AsyncActionCodec>;

export const succeededAsyncAction =
  (finalizedTxData: FinalizedTxData) =>
  (action: AsyncAction): AsyncAction => ({
    ...action,
    status: 'success',
    finalizedTxData,
  });

export const failedAsyncAction =
  (error: string, finalizedTxData?: FinalizedTxData) =>
  (action: AsyncAction): AsyncAction => ({
    ...action,
    status: 'error',
    error,
    finalizedTxData: finalizedTxData ?? null,
  });

export const CommonStateCodec = t.type({
  actions: t.type({
    latest: t.union([ActionIdCodec, t.null]),
    all: t.record(ActionIdCodec, AsyncActionCodec),
  }),
});
export const ActionHistoryCodec = t.type({
  latest: t.union([ActionIdCodec, t.null]),
  all: t.record(ActionIdCodec, AsyncActionCodec),
});
export type ActionHistory = t.TypeOf<typeof ActionHistoryCodec>;

export const Roles = {
  organizer: 'organizer',
  participant: 'participant',
  spectator: 'spectator',
} as const;

export const OrganizerWelcomeStateCodec = t.intersection([
  t.type({ publicKey: t.string, secretKey: t.string }),
  t.type({ role: t.union([t.literal(Roles.organizer), t.literal(Roles.spectator)]) }),
  CommonStateCodec,
]);
export type OrganizerWelcomeState = t.TypeOf<typeof OrganizerWelcomeStateCodec>;

export const ParticipantWelcomeStateCodec = t.intersection([
  t.type({ isCheckedIn: t.boolean, participantId: t.union([t.null, t.string]) }),
  CommonStateCodec,
]);
export type ParticipantWelcomeState = t.TypeOf<typeof ParticipantWelcomeStateCodec>;

export interface OrganizerWelcomeAPI {
  state$: Observable<OrganizerWelcomeState>;
  addParticipant: (participantId: string) => Promise<ActionId>;
  addOrganizer: (organizerPk: Uint8Array) => Promise<ActionId>;
}

export interface ParticipantWelcomeAPI {
  state$: Observable<ParticipantWelcomeState>;
  checkIn: (participantId: string) => Promise<ActionId>;
}
