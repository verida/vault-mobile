import walletUtils from '@verida/wallet-utils'
import { Transaction } from '/wallet/types'
import { AccountId, AssetType } from 'caip'

const createWallet = () => {
  const wallet = walletUtils.createWallet('algo')
  return wallet
}

const getWalletBalances = (walletAddress: AccountId.AccountIdParams) => {}

const getWalletBalanceForSingleToken = (
  walletAddress: AccountId.AccountIdParams,
  token: AssetType.AssetTypeParams
) => {}

const getWalletTransactions = (
  walletAddress: AccountId.AccountIdParams
): Transaction[] => {
  return []
}

export default {
  createWallet,
  getWalletBalances,
  getWalletBalanceForSingleToken,
  getWalletTransactions,
}
