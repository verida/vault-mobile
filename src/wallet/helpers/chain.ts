import utils from './utils'
import algorandUtil from './chains/algorand'
import ethereumUtil from './chains/ethereum'
import { Token } from './types'

const createWallets = () => {
  const algoWallet = algorandUtil.createWallet()
  const ethWallet = ethereumUtil.createWallet()

  return { algoWallet, ethWallet }
}

const getOwnedCoinsForAllChains = () => {
  // get wallet address for user for each chain from local state.
  const wallet_addresses = {
    ethereum: '...',
    algorand: '...',
  }
  const algoList = algorandUtil.getWalletBalances(wallet_addresses.ethereum)
  const ethList = ethereumUtil.getWalletBalances(wallet_addresses.algorand)
  // so on and so forth

  const list = utils.consolidateTokenBalancesAndMap([algoList, ethList])

  return list
}

const getOwnedQuantityForSingleToken = (
  walletAddress: string,
  token: Token
) => {
  const { chain } = token
  // get balance based on chain
  const balance = algorandUtil.getWalletBalanceForSingleToken(
    walletAddress,
    token
  )
  return balance
}

const getTransactionListForToken = (walletAddress, token) => {
  const { chain } = token
  // based on chain
  const transactions = algorandUtil.getWalletTransactions(walletAddress)
  const tokenTransactions = utils.filterTransactionsByToken(transactions, token)
  return tokenTransactions
}

export default {
  createWallets,
  getOwnedCoinsForAllChains,
  getOwnedQuantityForSingleToken,
  getTransactionListForToken,
}
