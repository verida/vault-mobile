import { isEmpty } from 'lodash'
import { createSelector } from 'reselect'
import {
  getNativeForChain,
  tokenCaipObjectToString,
} from 'wallet/helpers/tokens'

import { selectTokens } from 'reduxStore/tokens/selectors'

const s = (state) => state.main // Current wallet state sits in main reducer
export const selectedWalletSelector = (state) => s(state).selectedWallet

export const getBalancesData = (state) => {
  if (state.balances.data && state.balances.data.results) {
    return state.balances.data.results
  } else {
    return {}
  }
}

export const getTotalBalance = (state) => {
  if (state.balances.data && state.balances.data.totalBalance) {
    return state.balances.data.totalBalance
  } else {
    return 0
  }
}

export const getSingleWalletChain = (state) => {
  const wallet = getWallets(state)
  console.log(wallet, 'wallet')
  if (wallet.type === 'single' && wallet.chain) {
    return wallet.chain
  } else {
    return null
  }
}

export const getListAndTotal = (state) => {
  // map prices and balances to recognized coins list and standardize
  const balances = getBalancesData(state.main)
  const total = getTotalBalance(state.main)
  const singleChain = getSingleWalletChain(state.main)
  const allTokens = selectTokens(state)
  let tokens
  if (singleChain) {
    tokens = allTokens.filter((token) => token.chainName === singleChain)
  } else {
    tokens = allTokens
  }
  let list = []
  if (!isEmpty(balances)) {
    list = tokens.map((token) => {
      let tokenBalance = balances[token.symbol]
      // total = total + amount

      return {
        label: token.name,
        price: tokenBalance ? tokenBalance.quote.USD.price : 0,
        change: tokenBalance ? tokenBalance.quote.USD.percent_change_24h : 0,
        quantity: tokenBalance ? tokenBalance.balance : 0,
        amount: tokenBalance ? tokenBalance.amount : 0,
        ...token,
      }
    })
    return { list, total }
  } else {
    return { list, total }
  }
}

export const selectNativeTokenBalance = (state, token) => {
  const tokens = selectTokens(state)
  const native = getNativeForChain(tokens, token.identifier)
  const balances = getBalancesData(state.main)

  if (balances && native && balances[native.symbol]) {
    return balances[native.symbol].balance
  } else {
    0
  }
}

export const selectSingleTokenData = (state, assetID) => {
  const balances = getBalancesData(state.main)
  const tokens = selectTokens(state)

  // write the function.. find.. chain id.. reference.. compare whole onject.. convert to string?

  const token = tokens.find((ele) => {
    return (
      tokenCaipObjectToString(ele.asset) === tokenCaipObjectToString(assetID)
    )
  })

  let tokenBalance = balances[token.symbol]

  return {
    label: token.name,
    price: tokenBalance ? tokenBalance.quote.USD.price : 0,
    change: tokenBalance ? tokenBalance.quote.USD.percent_change_24h : 0,
    quantity: tokenBalance ? tokenBalance.balance : 0,
    amount: tokenBalance ? tokenBalance.amount : 0,
    ...token,
  }
}

export const getTokensData = (state) => {
  const loading = state.main.balances.fetching

  return {
    listAndTotal: getListAndTotal(state),
    loading: loading,
  }
}

export const getSelectedWalletId = (state) => {
  return state.selectedWallet
}

export const getWalletProcessingState = (state) => {
  return state.walletProcessing.loading
}

export const getAllWallets = (state) => {
  return state.wallets.data || []
}

export const getWalletCount = (state) => {
  const allWallets = getAllWallets(state)
  return Object.keys(allWallets).length || 0
}

export const getWalletsData = createSelector(
  getSelectedWalletId,
  getAllWallets,
  (selectedWallet, wallets) => wallets?.[selectedWallet]?.accounts || {}
)

export const getWallets = createSelector(
  getSelectedWalletId,
  getAllWallets,
  (selectedWallet, wallets) => wallets?.[selectedWallet] || {}
)

export const getWalletObjectById = (state, ID) => {
  return state.wallets.data[ID] || {}
}

export const selectPendingTransactions = (state, assetID) => {
  const pendingTransactions = state.pendingTransactions.data
  const transactionsForAsset = pendingTransactions.filter((ele) => {
    return (
      tokenCaipObjectToString(ele.token.asset) ===
      tokenCaipObjectToString(assetID)
    )
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
