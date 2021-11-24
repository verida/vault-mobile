import walletUtils from '@verida/wallet-utils'
import { Transaction } from '/wallet/types'

const createWallet = () => {
  const wallet = walletUtils.createWallet('ethr')
  return wallet
}

const getWalletBalances = (walletAddress) => {}

const getWalletBalanceForSingleToken = (walletAddress, token) => {}

const getWalletTransactions = (walletAddress): Transaction[] => {
  return []
}

export default {
  createWallet,
  getWalletBalances,
  getWalletBalanceForSingleToken,
  getWalletTransactions,
}
