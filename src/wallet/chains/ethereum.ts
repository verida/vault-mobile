import walletUtils from '@verida/wallet-utils'
import { Transaction } from '/wallet/types'
import { AccountId, AssetType } from 'caip'

const createWallet = () => {
  const wallet = walletUtils.createWallet('ethr')
  // convert address to CIAP
  return { ciapAddress, mnemonic: wallet.mnemonic }
}

const getWalletBalances = (walletAddress: AccountId.AccountIdParams) => {}

const getWalletBalanceForSingleToken = (
  walletAddress: AccountId.AccountIdParams,
  token: AssetType.AssetTypeParams
) => {}

const getWalletTransactions = (
  walletAddress: AccountId.AccountIdParams
): Transaction[] => {
  // get transactions from sdk
  const transactions = utils.standardizeTransactionsData(rawTransactions)

  return transactions
}

export default {
  createWallet,
  getWalletBalances,
  getWalletBalanceForSingleToken,
  getWalletTransactions,
}
