import { SUPPORTED_TOKENS } from 'wallet/constants'

export const getPricingData = (state) => state.pricing.data || {}

export const getBalancesData = (state) => {
  // standardize and map balances to recognized token symbols
  if (state.balances.data) {
    const balanceData = state.balances.data
    let list = {}
    list['ALGO'] = balanceData.amount
    if (balanceData.assets) {
      balanceData.assets.map((balance) => {
        let tok
        tok = SUPPORTED_TOKENS.find((ele) => {
          if (balance['asset-id']) {
            return ele.address === balance['asset-id'].toString()
          } else {
            return false
          }
        })
        if (tok) {
          list[tok.symbol] = balance.amount
        }
      })
    }
    return list
  } else {
    return {}
  }
}

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
          ? (tokenPrice.quote.USD.price * tokenBalance) / 1000000
          : 0
      total = total + amount

      return {
        label: token.name,
        symbol: token.symbol,
        icon: token.icon,
        address: token.address,
        price: tokenPrice ? tokenPrice.quote.USD.price : 0,
        change: tokenPrice ? tokenPrice.quote.USD.percent_change_24h : 0,
        quantity: tokenBalance ? tokenBalance : 0,
        amount,
      }
    })
    return { list, total }
  } else {
    return { list, total }
  }
}

export const getWalletsData = (state) => {
  return state.wallets.data || {}
}

export const getTransactionsData = (state) => {
  //   const userAddr = 'DI2MLO726S33IHHTKM5XMTQCE3MDV23QN3KFCZZYFIUWCURLALMTETKIBE'
  //   const userAddr = 'CG7CUMAJWSTIP4KPQHWIII7QEASDQTGSOYRPRJ4WX7QZ7OQDCNZPJSNLHE'
  const wallets = getWalletsData(state)
  const userAddr = wallets.algo.address
  const rawTransactions = state.transactions.data || []
  console.log(rawTransactions, 'rawTransactions')
  let transactions = []
  if (rawTransactions) {
    transactions = rawTransactions.map((tx) => {
      let isUserSender = tx.sender === userAddr
      let transferInfo = tx['asset-transfer-transaction']
        ? tx['asset-transfer-transaction']
        : tx['payment-transaction']
      return {
        id: tx.id,
        type: isUserSender ? 'sent' : 'received',
        address: isUserSender ? transferInfo.receiver : tx.sender,
        quantity: transferInfo.amount,
      }
    })
    return transactions
  } else {
    return []
  }
}

export const getTransactionParamsData = (state) => {
  return state.transactionParams.data || {}
}

export const selectSentTransaction = (state) => {
  return state.sentTransaction
}
