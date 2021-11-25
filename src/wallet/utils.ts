import {
  Transaction,
  TokenBalance,
  TokenPrice,
  TokenWithBalanceAndPrice,
} from './types'
import { AssetType } from 'caip'

const mapBalancesToPrices = (
  pricesList: TokenPrice[],
  tokensOwned: TokenBalance[]
): TokenWithBalanceAndPrice => {
  // map by token address and chain?
}

const calculateTotalForAllTokens = (
  pricesList: TokenPrice[],
  tokensOwned: TokenBalance[]
): number => {
  // calculate and return total
}

const consolidateTokenBalancesAndMap = (rawLists) => {
  // consolidate
  // map to recognized tokens list and return in standardized format
}

const standardizeTransactionsData = (rawTransactions): Transaction[] => {
  // standardize based on TransactionType
}

const filterTransactionsByToken = (
  transactions,
  token: AssetType.AssetTypeParams
): Transaction[] => {
  // filter by token address
  const transactions = []

  return transactions
}

export default {
  mapBalancesToPrices,
  calculateTotalForAllTokens,
  consolidateTokenBalancesAndMap,
  filterTransactionsByToken,
  standardizeTransactionsData,
}
