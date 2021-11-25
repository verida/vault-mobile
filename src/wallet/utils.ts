import { Transaction } from './types'
import { AssetType } from 'caip'

const mapBalancesToPrices = (pricesList, tokensOwned) => {
  // map by token address and chain?
}

const calculateTotalForAllTokens = (pricesList, tokensOwned) => {
  // calculate and return total
}

const consolidateTokenBalancesAndMap = (lists) => {
  // consolidate
  // map to recognized tokens list and return in standardized format
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
}
