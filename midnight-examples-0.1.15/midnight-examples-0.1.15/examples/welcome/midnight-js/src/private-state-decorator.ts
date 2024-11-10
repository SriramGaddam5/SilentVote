import { PrivateStateProvider, PrivateStateSchema, type PrivateStateKey } from '@midnight-ntwrk/midnight-js-types';
import type { ContractAddress } from '@midnight-ntwrk/ledger';
import type { SigningKey } from '@midnight-ntwrk/compact-runtime';
import { concatMap, delay, Observable, of, retry, startWith, Subject } from 'rxjs';
import { Logger } from 'pino';

const notification: unique symbol = Symbol('notification');

export interface SubscribablePrivateStateProvider<PSS extends PrivateStateSchema> extends PrivateStateProvider<PSS> {
  state$<PSK extends PrivateStateKey<PSS>>(key: PSK): Observable<PSS[PSK] | null>;
}

export class SubscribablePrivateStateProviderDecorator<PSS extends PrivateStateSchema>
  implements SubscribablePrivateStateProvider<PSS>
{
  #internalSubject = new Subject<typeof notification>();

  constructor(
    private readonly logger: Logger,
    private readonly wrapped: PrivateStateProvider<PSS>,
  ) {}
  state$<PSK extends PrivateStateKey<PSS>>(key: PSK): Observable<PSS[PSK] | null> {
    return this.#internalSubject.asObservable().pipe(
      startWith(notification),
      concatMap(() => this.get(key)),
      retry({
        count: 15,
        resetOnSuccess: true,
        delay: (error, count) => {
          const retryDelay = Math.random() * 5 * 2 ** count;
          this.logger.trace(
            { err: error, retryDelay },
            `SubscribablePrivateStateProviderDecorator faced an error when reading state, retrying in ${retryDelay}ms`,
          );
          return of(true).pipe(delay(retryDelay));
        },
      }),
    );
  }
  clear(): Promise<void> {
    return this.wrapped.clear().then(this.#notify);
  }

  get<PSK extends PrivateStateKey<PSS>>(key: PSK): Promise<PSS[PSK] | null> {
    return this.wrapped.get(key);
  }

  remove<PSK extends PrivateStateKey<PSS>>(key: PSK): Promise<void> {
    return this.wrapped.remove(key).then(this.#notify);
  }

  set<PSK extends PrivateStateKey<PSS>>(key: PSK, state: PSS[PSK]): Promise<void> {
    return this.wrapped.set(key, state).then(this.#notify);
  }

  setSigningKey(contractAddress: ContractAddress, signingKey: SigningKey): Promise<void> {
    return this.wrapped.setSigningKey(contractAddress, signingKey);
  }

  getSigningKey(contractAddress: ContractAddress): Promise<SigningKey | null> {
    return this.wrapped.getSigningKey(contractAddress);
  }

  removeSigningKey(contractAddress: ContractAddress): Promise<void> {
    return this.wrapped.removeSigningKey(contractAddress);
  }

  clearSigningKeys(): Promise<void> {
    return this.wrapped.clearSigningKeys();
  }

  #notify = <T>(input: T): T => {
    this.#internalSubject.next(notification);
    return input;
  };
}
