import utils from '../utils'
import algorandUtil from '../chains/algorand'
import ethereumUtil from '../chains/ethereum'
import { Transaction } from '../types'
import { AccountId, AssetType } from 'caip'

const createWallets = () => {
  const algoWallet = algorandUtil.createWallet()
  const ethWallet = ethereumUtil.createWallet()

  return { algoWallet, ethWallet }
}

const getOwnedTokensForAllChains = () => {
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
  walletAddress: AccountId.AccountIdParams,
  token: AssetType.AssetTypeParams
): number => {
  // get chain using CAIP js lib
  // get balance based on chain
  const balance = algorandUtil.getWalletBalanceForSingleToken(
    walletAddress,
    token
  )
  return balance
}

const getTransactionListForToken = (
  walletAddress: AccountId.AccountIdParams,
  token: AssetType.AssetTypeParams
): Transaction[] => {
  // get chain using CAIP js lib
  // based on chain
  const transactions = algorandUtil.getWalletTransactions(walletAddress)
  const tokenTransactions = utils.filterTransactionsByToken(transactions, token)
  return tokenTransactions
}

export default {
  createWallets,
  getOwnedTokensForAllChains,
  getOwnedQuantityForSingleToken,
  getTransactionListForToken,
}
