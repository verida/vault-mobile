import { SUPPORTED_TOKENS } from 'wallet/constants'
import {
  getTokenAddress,
  handleTokenDecimals,
  formatTokenQuantity,
} from 'wallet/helpers/tokens'

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
  return state.wallets.data || {}
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
  //   const userAddr = 'DI2MLO726S33IHHTKM5XMTQCE3MDV23QN3KFCZZYFIUWCURLALMTETKIBE'
  //   const userAddr = 'CG7CUMAJWSTIP4KPQHWIII7QEASDQTGSOYRPRJ4WX7QZ7OQDCNZPJSNLHE'
  const wallets = getWalletsData(state)
  const userAddr = wallets.algo.address
  const transactions = state.transactions.data || []
  const pendingTransactions = selectPendingTransactions(state, assetID)
  if (pendingTransactions.length > 0) {
    pendingTransactions.map((tx) => {
      let transactionCompleted = transactions.find((trans) => {
        return trans.id === tx.id
      })
      if (!transactionCompleted) {
        let isUserSender = tx.from === userAddr
        transactions.unshift({
          id: tx.id,
          type: isUserSender ? 'sent' : 'received',
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
  const wallets = getWalletsData(state)
  const userAddr = wallets.algo.address
  const rawTransaction = state.transactionDetails.data
  if (rawTransaction) {
    let isUserSender = rawTransaction.sender === userAddr
    let transferInfo = rawTransaction['asset-transfer-transaction']
      ? rawTransaction['asset-transfer-transaction']
      : rawTransaction['payment-transaction']
    let symbol
    let decimal
    let feeSymbol = SUPPORTED_TOKENS[0].symbol
    if (rawTransaction['asset-transfer-transaction']) {
      let tok = SUPPORTED_TOKENS.find(
        (ele) =>
          getTokenAddress(ele.address) ===
          rawTransaction['asset-transfer-transaction']['asset-id'].toString()
      )
      symbol = tok.symbol
      decimal = tok.decimal
    } else {
      symbol = SUPPORTED_TOKENS[0].symbol
      decimal = SUPPORTED_TOKENS[0].decimal
    }
    return {
      id: rawTransaction.id,
      type: isUserSender ? 'sent' : 'received',
      address: isUserSender ? transferInfo.receiver : rawTransaction.sender,
      quantity: transferInfo.amount,
      fee: rawTransaction.fee,
      round: rawTransaction['confirmed-round'],
      time: rawTransaction['round-time'],
      symbol,
      feeSymbol,
      decimal,
    }
  } else {
    return {}
  }
}

export const selectTransactionData = (state) => {
  const { fetching, error } = state.transactionDetails

  return {
    transaction: selectTransaction(state),
    loading: fetching,
    error: error,
  }
}
