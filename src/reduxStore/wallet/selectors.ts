import { AssetId } from 'caip'
import { BigNumber } from 'ethers'
import {
  getBalancesData,
  getTransactionDetailsData,
  getTransactionsForTokenData,
} from 'features/wallets'
import { createSelector } from 'reselect'
import {
  getWalletAddressForAsset,
  tokenCaipObjectToString,
} from 'wallet/helpers/tokens'

import { RootState } from 'reduxStore/types'

const s = (state: RootState) => state.main // Current wallet state sits in main reducer
// export const selectedWalletSelector = (state: RootState) =>
//   s(state).selectedWallet
// export const getAllWallets = (state: RootState) =>
//   getAllWallets(s(state)) || {}

// export const getBalancesData = (state) => {
//   if (state.balances.data && state.balances.data.results) {
//     return state.balances.data.results
//   } else {
//     return {}
//   }
// }

// export const getTotalBalance = (state) => {
//   if (state.balances.data && state.balances.data.totalBalance) {
//     return state.balances.data.totalBalance
//   } else {
//     return 0
//   }
// }

// export const getSingleWalletChain = (state) => {
//   const wallet = getWallets(state)
//   if (wallet.type === 'single' && wallet.chain) {
//     return wallet.chain
//   } else {
//     return null
//   }
// }

// @chris done, although deprecate selectTokens
// export const getListAndTotal = (state) => {
//   // map prices and balances to recognized coins list and standardize
//   const { list, total } = getBalancesData(state.main)
//   // const total = getTotalBalance(state.main)

//   // if (isEmpty(balances)) return { list: [], total }

//   return {
//     list,
//     total,
//   }
// }

// export const selectNativeTokenBalance = (state, token) => {
//   const native = getNativeForChain(tokens, token.chainName)
//   const balances = getBalancesData(state.main)

//   if (balances && native && balances[native.symbol]) {
//     return balances[native.symbol].balance
//   } else {
//     0
//   }
// }

// @chris done
export const selectSingleTokenData = (state: RootState, asset: AssetId) => {
  const selectedWallet = getSelectedWalletById(state)
  const addresses = getUniqueWalletAddresses(selectedWallet)
  const { list } = getBalancesData(state, addresses)

  const tokenBalance = list?.find((item) => {
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
    price: tokenBalance.quote.USD.price,
    change: tokenBalance.quote.USD.percent_change_24h,
    quantity: tokenBalance.balance,
    amount: tokenBalance.amount,
  }
}

// export const getTokensData = (state) => {
//   const loading = state.main.balances.fetching

//   return {
//     listAndTotal: getListAndTotal(state),
//     loading: loading,
//   }
// }

export const getAllWallets = (state) => {
  return s(state).wallets.data || {}
}

export const getSelectedWalletId = (state) => {
  return s(state).selectedWallet
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
      icon = wallet.blockchainNetwork?.icon
    }

    return {
      ...wallet,
      id: wallet._id,
      label: wallet.label,
      icon,
      count: Object.keys(wallet.accounts).length,
      address: addresses.length === 1 ? addresses[0] : null,
    }
  })
}

export const getUniqueWalletAddresses = (wallet) => {
  if (!wallet) return []

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
  const selectedWalletId = s(state).selectedWallet
  const selectedWallet = walletList.find((item) => item.id === selectedWalletId)
  return selectedWallet
}

export const getWalletProcessingState = (state) => {
  return s(state).walletProcessing.loading
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
  return s(state).wallets.data[ID] || {}
}

// TODO: Replace with API data
export const selectPendingTransactions = (state, assetID) => {
  const pendingTransactions = s(state).pendingTransactions.data
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

export const selectTransactions = (state: RootState, assetID: AssetId) => {
  const wallets = getWalletsData(state)
  const userAddress = getWalletAddressForAsset(assetID, wallets)
  const transactions = [
    ...getTransactionsForTokenData(state, userAddress, assetID),
  ]
  const pendingTransactions = selectPendingTransactions(state, assetID)
  if (pendingTransactions.length > 0) {
    pendingTransactions.map((tx: any) => {
      // TODO: tx type
      const transactionCompleted = transactions.find((trans) => {
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

// export const selectTransactionsData = (state, assetID) => {
//   const { fetching, error } = state.transactions

//   return {
//     list: error ? [] : selectTransactions(state, assetID),
//     loading: fetching,
//     errorType: error,
//     errorMessage: state.transactions.data,
//   }
// }

export const getTransactionParamsData = (state) => {
  return s(state).transactionParams.data || {}
}

export const selectSentTransaction = (state) => {
  const transaction = {
    ...s(state).sentTransaction,
    data: { ...s(state).sentTransaction.data },
  }
  if (transaction.data.amount) {
    transaction.data.amount = BigNumber.from(transaction.data.amount)
  }
  return transaction
}

// export const selectTransaction = (state) => {
//   getTransactionDetailsData(state)
//   return s(state).transactionDetails.data || {}
// }

// export const selectTransactionData = (state) => {
//   const { fetching, error } = s(state).transactionDetails

//   return {
//     transaction: selectTransaction(state),
//     loading: fetching,
//     error: error,
//   }
// }

export const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
}).format
