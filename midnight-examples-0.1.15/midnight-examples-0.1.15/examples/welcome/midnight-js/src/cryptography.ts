import * as uuid from 'uuid';
import { fromHex } from '@midnight-ntwrk/midnight-js-utils';

export type Cryptography = {
  randomSk: () => Uint8Array;
  randomUUID: () => string;
};

export const DEFAULT_SK_LENGTH = 32;

export const webCryptoCryptography = (crypto: Crypto): Cryptography => {
  const randomBytes = (length: number): Uint8Array => {
    const out = new Uint8Array(length);
    crypto.getRandomValues(out);
    return out;
  };

  return {
    randomSk: (): Uint8Array => randomBytes(DEFAULT_SK_LENGTH),
    randomUUID: () => crypto.randomUUID(),
  };
};

// This is hack necessary because communication with the indexer and proving server does not use TLS, meaning
// the welcome application is not in a Secure Context.
export const unsafeCryptography = (): Cryptography => {
  return {
    randomUUID: () => uuid.v1(),
    randomSk: () => fromHex([...Array(DEFAULT_SK_LENGTH * 2)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')),
  };
};
