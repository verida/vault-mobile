import walletUtils from '@verida/wallet-utils'

const createWallet = () => {
  const wallet = walletUtils.createWallet('algo')
  return wallet
}

const getWalletBalances = (walletAddress) => {}

const getWalletBalanceForSingleToken = (walletAddress, token) => {}

const getWalletTransactions = (walletAddress) => {}

export default {
  createWallet,
  getWalletBalances,
  getWalletBalanceForSingleToken,
  getWalletTransactions,
}
