import { SUPPORTED_TOKENS } from 'wallet/constants'
import { formatTokenQuantity, handleTokenDecimals } from 'wallet/helpers/tokens'

export const getPricingData = (state) => state.pricing.data || {}

export const getBalancesData = (state) => state.balances.data || {}

export const getListAndTotal = (state) => {
  // map prices and balances to recognized coins list and standardize
  const pricing = getPricingData(state)
  const balances = getBalancesData(state)
  let total = 0
  let list = []
  if (pricing || balances) {
    list = SUPPORTED_TOKENS.map((token) => {
      let tokenPrice = pricing[token.symbol]
      let tokenBalance = balances[token.symbol]
      let amount =
        tokenPrice && tokenBalance
          ? tokenPrice.quote.USD.price *
            handleTokenDecimals(tokenBalance, token.decimal)
          : 0
      total = total + amount

      return {
        label: token.name,
        symbol: token.symbol,
        icon: token.icon,
        address: token.address,
        price: tokenPrice ? tokenPrice.quote.USD.price : 0,
        change: tokenPrice ? tokenPrice.quote.USD.percent_change_24h : 0,
        quantity: tokenBalance
          ? formatTokenQuantity(tokenBalance, token.decimal)
          : 0,
        amount,
        decimal: token.decimal,
      }
    })
    return { list, total }
  } else {
    return { list, total }
  }
}

export const selectNativeTokenBalance = (state) => {
  const balances = getBalancesData(state)
  if (balances) {
    // TODO: dont hardcode decimals
    return formatTokenQuantity(balances.ALGO, SUPPORTED_TOKENS[0].decimal)
  } else {
    0
  }
}

export const selectSingleTokenData = (state, assetID) => {
  const pricing = getPricingData(state)
  const balances = getBalancesData(state)

  const token = SUPPORTED_TOKENS.find((ele) => {
    return ele.address === assetID
  })

  let tokenPrice = pricing[token.symbol]
  let tokenBalance = balances[token.symbol]
  let amount =
    tokenPrice && tokenBalance
      ? tokenPrice.quote.USD.price *
        handleTokenDecimals(tokenBalance, token.decimal)
      : 0

  return {
    label: token.name,
    symbol: token.symbol,
    icon: token.icon,
    address: token.address,
    price: tokenPrice ? tokenPrice.quote.USD.price : 0,
    change: tokenPrice ? tokenPrice.quote.USD.percent_change_24h : 0,
    quantity: tokenBalance
      ? formatTokenQuantity(tokenBalance, token.decimal)
      : 0,
    amount,
    decimal: token.decimal,
  }
}

export const getTokensData = (state) => {
  const loading = state.pricing.fetching && state.balances.fetching

  return {
    listAndTotal: getListAndTotal(state),
    loading: loading,
  }
}

export const getWalletsData = (state) => {
  return state.wallets.data.accounts || {}
}

export const selectPendingTransactions = (state, assetID) => {
  const pendingTransactions = state.pendingTransactions.data
  const transactionsForAsset = pendingTransactions.filter((ele) => {
    return ele.token.address === assetID
  })
  if (transactionsForAsset) {
    return transactionsForAsset
  } else {
    return null
  }
}

export const selectTransactions = (state, assetID) => {
  const transactions = state.transactions.data || []
  const pendingTransactions = selectPendingTransactions(state, assetID)
  if (pendingTransactions.length > 0) {
    pendingTransactions.map((tx) => {
      let transactionCompleted = transactions.find((trans) => {
        return trans.id === tx.id
      })
      if (!transactionCompleted) {
        transactions.unshift({
          id: tx.id,
          type: 'sent',
          address: tx.to,
          quantity: tx.amount,
          pending: true,
        })
      }
    })
  }
  return transactions
}

export const selectTransactionsData = (state, assetID) => {
  const { fetching, error } = state.transactions

  return {
    list: selectTransactions(state, assetID),
    loading: fetching,
    error: error,
  }
}

export const getTransactionParamsData = (state) => {
  return state.transactionParams.data || {}
}

export const selectSentTransaction = (state) => {
  return state.sentTransaction
}

export const selectTransaction = (state) => {
  return state.transactionDetails.data || {}
}

export const selectTransactionData = (state) => {
  const { fetching, error } = state.transactionDetails

  return {
    transaction: selectTransaction(state),
    loading: fetching,
    error: error,
  }
}
