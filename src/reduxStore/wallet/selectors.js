import { AssetId } from 'caip'
import { BigNumber } from 'ethers'
import { isEmpty } from 'lodash'
import { createSelector } from 'reselect'
import {
  getNativeForChain,
  tokenCaipObjectToString,
} from 'wallet/helpers/tokens'

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
        price: parseFloat(tokenBalance.quote.USD.price),
        change: parseFloat(tokenBalance.quote.USD.percent_change_24h),
        quantity: parseFloat(tokenBalance.balance),
        amount: parseFloat(tokenBalance.amount),
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
export const selectSingleTokenData = (state, asset) => {
  const balances = getBalancesData(state.main)

  const tokenBalance = balances.find((item) => {
    return new AssetId(item.asset).toString() === new AssetId(asset).toString()
  })

  // We should always find a token balance, so this shouldn't happen
  // but just in case, return 0 values if not found
  if (!tokenBalance) {
    return {
      label: '',
      price: 0,
      change: 0,
      quantity: 0,
      amount: 0,
    }
  }

  return {
    ...tokenBalance,
    label: tokenBalance.symbol,
    price: parseFloat(tokenBalance.quote.USD.price),
    change: parseFloat(tokenBalance.quote.USD.percent_change_24h),
    quantity: parseFloat(tokenBalance.balance),
    amount: parseFloat(tokenBalance.amount),
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
  const transactions = [...state.transactions.data] || []
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
    list: error ? [] : selectTransactions(state, assetID),
    loading: fetching,
    errorType: error,
    errorMessage: state.transactions.data,
  }
}

export const getTransactionParamsData = (state) => {
  return state.transactionParams.data || {}
}

export const selectSentTransaction = (state) => {
  const transaction = {
    ...state.sentTransaction,
    data: { ...state.sentTransaction.data },
  }
  if (transaction.data.amount) {
    transaction.data.amount = BigNumber.from(transaction.data.amount)
  }
  return transaction
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

export const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
}).format
