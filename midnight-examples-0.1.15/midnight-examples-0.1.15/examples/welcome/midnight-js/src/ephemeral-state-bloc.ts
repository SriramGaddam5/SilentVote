import {
  AsyncAction,
  ActionId,
  failedAsyncAction,
  succeededAsyncAction,
  ActionHistory,
  FinalizedTxData,
} from '@midnight-ntwrk/welcome-api';
import { Bloc, Resource } from '@midnight-ntwrk/welcome-helpers';
import { Logger } from 'pino';

/**
 * Ephemeral state of welcome application - manages async actions and their statuses
 * It does not need to be persisted at all, but it is an important
 * piece of data mostly in terms of knowing if there is some local action in-progress
 */
export type EphemeralState = { actions: ActionHistory };

const emptyEphemeralState: EphemeralState = {
  actions: {
    latest: null,
    all: {},
  },
};

const addAction =
  (action: AsyncAction) =>
  (state: EphemeralState): EphemeralState => ({
    actions: {
      latest: action.id,
      all: {
        ...state.actions.all,
        [action.id]: action,
      },
    },
  });

const updateAction =
  (actionId: ActionId, updater: (action: AsyncAction) => AsyncAction) =>
  (state: EphemeralState): EphemeralState => {
    return {
      actions: {
        ...state.actions,
        all: {
          ...state.actions.all,
          [actionId]: updater(state.actions.all[actionId]),
        },
      },
    };
  };

const succeedAction = (id: ActionId, finalizedTxData: FinalizedTxData) => updateAction(id, succeededAsyncAction(finalizedTxData));

const failAction = (id: ActionId, error: string, finalizedTxData?: FinalizedTxData) =>
  updateAction(id, failedAsyncAction(error, finalizedTxData));

export class EphemeralStateBloc extends Bloc<EphemeralState> {
  static init(logger: Logger): Resource<EphemeralStateBloc> {
    return Bloc.asResource(() => new EphemeralStateBloc(emptyEphemeralState, logger));
  }

  constructor(initialState: EphemeralState, logger: Logger) {
    super(initialState, logger);
  }

  addAction(action: AsyncAction) {
    return this.updateState(addAction(action));
  }

  succeedAction(id: ActionId, finalizedTxData: FinalizedTxData) {
    return this.updateState(succeedAction(id, finalizedTxData));
  }

  failAction(id: ActionId, error: string, finalizedTxData?: FinalizedTxData) {
    return this.updateState(failAction(id, error, finalizedTxData));
  }
}
