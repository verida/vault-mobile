import { isEmpty } from 'lodash'
import { store } from 'reduxStore'
import { createSelector } from 'reselect'
import {
  getNativeForChain,
  tokenCaipObjectToString,
} from 'wallet/helpers/tokens'

import { getBlockchainNetworks } from 'reduxStore/selectors'
import { selectTokens } from 'reduxStore/tokens/selectors'

const s = (state) => state.main // Current wallet state sits in main reducer
export const selectedWalletSelector = (state) => s(state).selectedWallet
export const allWalletsSelector = (state) => getAllWallets(s(state)) || {}

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
  if (wallet.type === 'single' && wallet.chain) {
    return wallet.chain
  } else {
    return null
  }
}

// @chris done, although deprecate selectTokens
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
    const list = balances.map((tokenBalance) => {
      return {
        ...tokenBalance,
        label: tokenBalance.symbol,
        price: tokenBalance.quote.USD.price,
        change: tokenBalance.quote.USD.percent_change_24h,
        quantity: tokenBalance.balance,
        amount: tokenBalance.amount,
      }
    })
    return { list, total }
  } else {
    return { list, total }
  }
}

export const selectNativeTokenBalance = (state, token) => {
  const tokens = selectTokens(state)
  const native = getNativeForChain(tokens, token.chainName)
  const balances = getBalancesData(state.main)

  if (balances && native && balances[native.symbol]) {
    return balances[native.symbol].balance
  } else {
    0
  }
}

// @chris done
export const selectSingleTokenData = (state, assetId) => {
  const balances = getBalancesData(state.main)

  const tokenBalance = balances.find((item) => {
    return item.asset == assetId
  })

  return {
    ...tokenBalance,
    label: tokenBalance.symbol,
    price: tokenBalance.quote.USD.price,
    change: tokenBalance.quote.USD.percent_change_24h,
    quantity: tokenBalance.balance,
    amount: tokenBalance.amount,
  }
}

export const getTokensData = (state) => {
  const loading = state.main.balances.fetching

  return {
    listAndTotal: getListAndTotal(state),
    loading: loading,
  }
}

export const getAllWallets = (state) => {
  return state.wallets.data || {}
}

export const getSelectedWalletId = (state) => {
  return state.selectedWallet
}

// @chris done
export const getWalletList = (state) => {
  const allWallets = getAllWallets(state)

  return Object.values(allWallets).map((wallet) => {
    const addresses = Object.values(wallet.accounts).map((account) => {
      return account.address
    })

    let icon
    if (!wallet.multiChain) {
      icon = wallet.blockchainNetwork.icon
    }

    return {
      id: wallet._id,
      label: wallet.label,
      icon,
      count: Object.keys(wallet.accounts).length,
      address: addresses.length === 1 ? addresses[0] : null,
    }
  })
}

export const getUniqueWalletAddresses = (wallet) => {
  const addresses = []
  Object.values(wallet.accounts).map((account) => {
    const id = `${account.chainId}:${account.address}`
    if (addresses.indexOf(id) === -1) {
      addresses.push(id)
    }
  })
  return addresses
}

export const getSelectedWalletById = (state) => {
  const walletList = getWalletList(state)
  const selectedWalletId = state.selectedWallet
  const selectedWallet = walletList.find((item) => item.id === selectedWalletId)
  return selectedWallet
}

export const getWalletProcessingState = (state) => {
  return state.walletProcessing.loading
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
