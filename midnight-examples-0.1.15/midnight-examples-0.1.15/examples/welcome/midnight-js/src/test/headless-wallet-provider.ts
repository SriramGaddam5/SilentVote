import { CoinInfo, Transaction, TransactionId } from '@midnight-ntwrk/ledger';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  BalancedTransaction,
  createBalancedTx,
  MidnightProvider,
  UnbalancedTransaction,
  WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { Wallet } from '@midnight-ntwrk/wallet-api';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import { firstValueFrom } from 'rxjs';

/**
 * Creates Wallet Provider and Midnight Provider based on wallet instance
 *
 * It is mostly just exposing bits of wallet state or calling its methods. The only places that might be confusing
 * are the one related to `Transaction.deserialize(tx.serialize)` - they are needed because there exist 3 WASM libraries
 * that implement some parts of Midnight API, there is some overlap between them but the wrapping code performs
 * `instanceof` checks, which would require either using a single library everywhere (with its own challenges) or the conversions.
 */
export const headlessWalletAndMidnightProvider = async (wallet: Wallet): Promise<WalletProvider & MidnightProvider> => {
  const state = await firstValueFrom(wallet.state());
  return {
    coinPublicKey: state.coinPublicKey,
    balanceTx(tx: UnbalancedTransaction, newCoins: CoinInfo[]): Promise<BalancedTransaction> {
      return wallet
        .balanceTransaction(ZswapTransaction.deserialize(tx.serialize(getLedgerNetworkId()), getZswapNetworkId()), newCoins)
        .then((tx) => wallet.proveTransaction(tx))
        .then((zswapTx) => Transaction.deserialize(zswapTx.serialize(getZswapNetworkId()), getLedgerNetworkId()))
        .then(createBalancedTx);
    },
    submitTx(tx: BalancedTransaction): Promise<TransactionId> {
      return wallet.submitTransaction(tx);
    },
  };
};
