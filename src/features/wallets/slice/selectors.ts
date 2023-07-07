import { AssetId } from 'caip'
import { BigNumber } from 'ethers'
import { getBalancesData, getTransactionsForTokenData } from 'features/wallets'
import { createSelector } from 'reselect'
import {
  getWalletAddressForAsset,
  tokenCaipObjectToString,
} from 'wallet/helpers/tokens'

import { BlockchainNetwork, BlockchainWalletWithAccounts } from 'api/types'
import { RootState } from 'reduxStore/types'

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

export const getAllWallets = (state: RootState) => {
  return state.wallets.walletsData
}

export const getSelectedWalletId = (state: RootState) => {
  return state.wallets.selectedWalletId
}

export const getWalletList = (
  state: RootState
): BlockchainWalletWithAccounts[] => {
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
      icon,
      count: Object.keys(wallet.accounts).length,
      address: addresses.length === 1 ? addresses[0] : undefined,
    }
  })
}

export const getUniqueWalletAddresses = (
  wallet: BlockchainWalletWithAccounts
) => {
  if (!wallet) return []

  const addresses: string[] = []
  Object.values(wallet.accounts).map((account) => {
    const id = `${account.chainId}:${account.address}`
    if (addresses.indexOf(id) === -1) {
      addresses.push(id)
    }
  })
  return addresses
}

export const getSelectedWalletById = (state: RootState) => {
  const walletList = getWalletList(state)
  const selectedWalletId = state.wallets.selectedWalletId
  const selectedWallet = walletList.find(
    (item) => item._id === selectedWalletId
  )!
  return selectedWallet as BlockchainWalletWithAccounts
}

export const getWalletProcessingState = (state: RootState) => {
  return state.wallets.walletProcessing.loading
}

export const getWalletCount = (state: RootState) => {
  const allWallets = getAllWallets(state)
  return Object.keys(allWallets).length || 0
}

export const getWalletsData = createSelector(
  getSelectedWalletId,
  getAllWallets,
  (selectedWalletId, wallets) => wallets?.[selectedWalletId!]?.accounts || {}
)

export const getWallets = createSelector(
  getSelectedWalletId,
  getAllWallets,
  (selectedWallet, wallets) => wallets?.[selectedWallet!] || {}
)

export const getWalletObjectById = (state: RootState, id: string) => {
  return state.wallets.walletsData[id] || {}
}

// TODO: Replace with API data
export const selectPendingTransactions = (
  state: RootState,
  assetID: AssetId
) => {
  const pendingTransactions = state.wallets.pendingTransactions.data
  const transactionsForAsset = pendingTransactions.filter((ele) => {
    return (
      tokenCaipObjectToString(ele.token.asset) ===
      tokenCaipObjectToString(assetID)
    )
  })
  if (transactionsForAsset) {
    return transactionsForAsset
  } else {
    return []
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

export const getTransactionParamsData = (state: RootState) => {
  return state.wallets.transactionParams.data || {}
}

export const selectSentTransaction = (state: RootState) => {
  const transaction = {
    ...state.wallets.sentTransaction,
    data: { ...state.wallets.sentTransaction.data },
  }
  if (transaction.data.amount) {
    transaction.data.amount = BigNumber.from(transaction.data.amount)
  }
  return transaction
}

export const selectNativeTokenBalance = (
  state: RootState,
  token: BlockchainNetwork
) => {
  const wallets = getWallets(state)
  const addresses = getUniqueWalletAddresses(wallets)
  const { list: balances } = getBalancesData(state, addresses)

  if (balances && balances.some((item) => item.symbol === token.symbol)) {
    return balances.find((item) => item.symbol === token.symbol)?.balance ?? 0
  } else {
    0
  }
}

export const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
}).format
