// import { createAsyncThunk } from '@reduxjs/toolkit'
// import * as SecureStore from 'helpers/VeridaSecureStore'
// import { WALLET_SCHEMA_0_2_0_URI } from 'wallet/constants'
// import dataHelper from 'wallet/data'

// import AccountManager from 'api/AccountManager'
// import { WalletManager } from 'api/Wallet/WalletManager'
// import CONFIG from 'config/environment'
// import { navigate } from 'navigation/RootNavigator'
// import { RootState } from 'reduxStore/types'
// import {
//   getSelectedWalletId,
//   getWalletList,
//   getWalletsData,
// } from 'reduxStore/wallet/selectors'

// import { walletsSlice } from './walletsSlice'

// export const { saveUserWallets, setSelectedWallet, removeUserWallets } =
//   walletsSlice.actions

// // @chris done
// // export const getBalances = () => {
// //   return async (dispatch, getState) => {
// //     dispatch({ type: BALANCES_FETCH_START })

// //     try {
// //       const wallets = getWalletsData(getState())
// //       const walletParams = Object.values(wallets).map(
// //         (item) => `${item.chainId}:${item.address}`
// //       )
// //       const requestParams = {
// //         wallet: walletParams,
// //       }

// //       const balanceData = await walletProviderApi.get(
// //         'balance/getBalanceByChains',
// //         requestParams
// //       )

// //       if (balanceData.data) {
// //         dispatch({
// //           type: FETCHED_BALANCES,
// //           data: balanceData.data.data.results,
// //         })
// //       } else {
// //         dispatch({
// //           type: BALANCES_FETCH_FAILED,
// //           error: 'error',
// //         })
// //       }
// //     } catch (error) {
// //       dispatch({
// //         type: BALANCES_FETCH_FAILED,
// //         error: 'error',
// //       })
// //     }
// //   }
// // }

// // @chris done
// // export const getTransactionsForToken = (token) => {
// //   return async (dispatch, getState) => {
// //     dispatch({ type: TRANSACTIONS_FETCH_START })
// //     const wallets = getWalletsData(getState())
// //     const userAddress = getWalletAddressForAsset(token.asset, wallets)
// //     const transactionsData = await walletProviderApi.post('transaction/list', {
// //       userAddress,
// //       asset: token.asset,
// //     })

// //     const responseData = transactionsData.data

// //     if (transactionsData) {
// //       dispatch({
// //         type: FETCHED_TRANSACTIONS,
// //         ...responseData,
// //       })
// //     } else {
// //       dispatch({
// //         type: TRANSACTIONS_FETCH_FAILED,
// //         error: 'Unable to reach server to fetch transactions',
// //       })
// //     }
// //   }
// // }

// // @chris done
// // export const getTransactionDetails = (transactionID, token) => {
// //   return async (dispatch, getState) => {
// //     dispatch({ type: TRANSACTION_DETAIL_FETCH_START })
// //     const wallets = getWalletsData(getState())

// //     const userAddress = getWalletAddressForAsset(token.asset, wallets)

// //     const transactionsData = await walletProviderApi.post('transaction/get', {
// //       transactionId: transactionID,
// //       userAddress,
// //       asset: token.asset,
// //     })

// //     if (transactionsData) {
// //       dispatch({
// //         type: FETCHED_TRANSACTION_DETAIL,
// //         data: transactionsData.data.data,
// //       })
// //     } else {
// //       dispatch({
// //         type: TRANSACTION_DETAIL_FETCH_FAILED,
// //         error: "Couldn'nt load transactions",
// //       })
// //     }
// //   }
// // }

// // @Andy done
// // export const saveUserWallets = (wallets) => {
// //   return {
// //     type: SET_USER_WALLETS,
// //     data: wallets,
// //   }
// // }

// // // @Andy done
// // export const removeUserWallets = () => {
// //   return {
// //     type: REMOVE_USER_WALLETS,
// //   }
// // }

// // // @Andy done
// // export const setSelectedWallet = (walletId) => {
// //   return {
// //     type: SET_SELECTED_WALLET,
// //     data: walletId,
// //   }
// // }

// // TODO migrate to API
// export const getTransactionParams = createAsyncThunk(
//   'wallets/getTransactionParams',
//   async (transactionData, { getState, rejectWithValue }) => {
//     // dispatch({ type: TRANSACTION_PARAMS_FETCH_START })
//     const wallets = getWalletsData(getState() as RootState)
//     const params = await dataHelper.getTransactionParams(
//       transactionData,
//       wallets
//     )

//     if (params) {
//       // dispatch({
//       //   type: FETCHED_TRANSACTION_PARAMS,
//       //   data: params,
//       // })

//       // fulfillWithValue(params)
//       navigate('ConfirmTransaction', transactionData)
//       return params
//     } else {
//       // dispatch({
//       //   type: TRANSACTION_PARAMS_FETCH_FAILED,
//       //   error: "Couldn't load params",
//       // })
//       rejectWithValue({ error: "Couldn't load params" })
//     }
//   }
// )

// export const sendTransaction = createAsyncThunk(
//   'wallets/sendTransaction',
//   async (
//     { transactionData, isAssetEnablingTransaction }: any,
//     { getState, rejectWithValue, fulfillWithValue }
//   ) => {
//     // dispatch({ type: SEND_TRANSACTION_START })
//     const state = getState()

//     try {
//       const txData = await dataHelper.sendTransaction(
//         transactionData,
//         isAssetEnablingTransaction,
//         state
//       )
//       // dispatch({
//       //   type: SEND_TRANSACTION_SUCCESS,
//       //   data: txData,
//       // })

//       // dispatch({
//       //   type: ADD_PENDING_TRANSACTION,
//       //   data: txData,
//       // })

//       fulfillWithValue(txData)

//       if (!isAssetEnablingTransaction) {
//         navigate('TransactionSuccess', undefined)
//       }
//     } catch (error) {
//       // dispatch({
//       //   type: SEND_TRANSACTION_FAILED,
//       //   error: error.message,
//       // })
//       rejectWithValue({
//         message: 'Could not create wallet',
//         error: error.message,
//       })

//       if (!isAssetEnablingTransaction) {
//         navigate('TransactionFailure', undefined)
//       }
//     }
//   }
// )

// // These first
// export const createNewWallet = createAsyncThunk(
//   'wallets/createNewWallet',
//   async (
//     data: { phrase: string; name: string },
//     { rejectWithValue, dispatch }
//   ) => {
//     // dispatch({ type: WALLET_PROCESSING_START })

//     try {
//       const { selectedWallet, wallets } = await WalletManager.createNewWallet(
//         data.phrase,
//         data.name
//       )

//       if (wallets) {
//         dispatch(saveUserWallets(wallets))
//         dispatch(setSelectedWallet(selectedWallet._id))

//         // save to the storage..
//         await Promise.all([
//           SecureStore.setItemAsync(
//             CONFIG.WALLETS_STORAGE_KEY,
//             JSON.stringify(wallets)
//           ),
//           SecureStore.setItemAsync(
//             CONFIG.SELECTED_WALLET_STORAGE_KEY,
//             selectedWallet._id
//           ),
//         ])
//       }

//       // dispatch({ type: WALLET_PROCESSING_FINISHED })
//     } catch (error: any) {
//       // dispatch({
//       //   type: WALLET_PROCESSING_FAILED,
//       //   error: error,
//       // })
//       rejectWithValue({ error: 'Could not create wallet' })
//     }
//   }
// )

// export const importWallet = createAsyncThunk(
//   'wallets/importWallet',
//   async (
//     data: {
//       name: string
//       inputSwitch: string
//       phrase: string
//       walletType: string
//       privateKey: string
//     },
//     { rejectWithValue, dispatch }
//   ) => {
//     // dispatch({ type: WALLET_PROCESSING_START })

//     try {
//       const mnemonic = data.inputSwitch === 'seedPhrase' ? data.phrase : null
//       const privateKey =
//         data.inputSwitch === 'privateKey' ? data.privateKey : null
//       const walletType = data.walletType

//       // save mnemonic to verida store
//       const walletDb =
//         await AccountManager.getInstance().context?.openDatastore(
//           WALLET_SCHEMA_0_2_0_URI
//         )

//       const wallet = {
//         walletType,
//         label: data.name,
//       }
//       if (mnemonic) wallet.mnemonic = mnemonic
//       if (privateKey) wallet.privateKey = privateKey
//       const saved = await walletDb?.save(wallet)
//       const walletId = saved?.id
//       await AccountManager.getInstance().restoreUserWallet(false)
//       dispatch(setSelectedWallet(walletId))

//       // dispatch({ type: WALLET_PROCESSING_FINISHED })
//     } catch (error) {
//       rejectWithValue('Could not import wallet')
//       // dispatch({
//       //   type: WALLET_PROCESSING_FAILED,
//       //   error: error,
//       // })
//     }
//   }
// )

// export const addWatchedWallet = createAsyncThunk(
//   'wallets/addWatchedWallet',
//   async (
//     data: {
//       label: string
//       blockchain: string
//       publicAddress: string
//     },
//     { rejectWithValue, dispatch }
//   ) => {
//     // dispatch({ type: WALLET_PROCESSING_START })
//     try {
//       const walletsDatastore =
//         await AccountManager.getInstance().context?.openDatastore(
//           WALLET_SCHEMA_0_2_0_URI
//         )

//       if (!walletsDatastore) {
//         throw new Error('Cannot get wallets datastore')
//       }

//       const wallet = {
//         label: data.label,
//         walletType: data.blockchain,
//         address: data.publicAddress,
//       }

//       const savedWallet = await walletsDatastore.save(wallet)
//       if (!savedWallet) {
//         throw new Error(walletsDatastore.errors)
//       }

//       await AccountManager.getInstance().restoreUserWallet(false)
//       dispatch(setSelectedWallet(savedWallet.id))

//       // dispatch({ type: WALLET_PROCESSING_FINISHED })
//     } catch (error) {
//       // dispatch({
//       //   type: WALLET_PROCESSING_FAILED,
//       //   error: error,
//       // })
//       rejectWithValue('Could not add watched wallet')
//     }
//   }
// )

// export const deleteWallet = createAsyncThunk(
//   'wallets/deleteWallet',
//   async (walletId: string, { getState, rejectWithValue, dispatch }) => {
//     // dispatch({ type: WALLET_PROCESSING_START })

//     try {
//       const currentlySelectedWallet = getSelectedWalletId(getState())
//       const walletDb =
//         await AccountManager.getInstance().context?.openDatastore(
//           WALLET_SCHEMA_0_2_0_URI
//         )
//       // save to verida store
//       await walletDb?.delete(walletId)

//       // update redux store
//       const updatedWalletsList = getWalletList(getState()).filter(
//         (wallet) => wallet._id !== walletId
//       )
//       dispatch(saveUserWallets(updatedWalletsList as any)) // TODO: type

//       if (currentlySelectedWallet === walletId) {
//         const nextWalletId = Object.values(updatedWalletsList)[0].id
//         await dispatch(setSelectedWallet(nextWalletId))
//       }

//       await AccountManager.getInstance().restoreUserWallet(false)
//       // dispatch({ type: WALLET_PROCESSING_FINISHED })
//     } catch (error) {
//       // dispatch({
//       //   type: WALLET_PROCESSING_FAILED,
//       //   error: error,
//       // })
//       rejectWithValue('Could not delete wallet')
//     }
//   }
// )

// export const renameWallet = createAsyncThunk(
//   'wallets/renameWallet',
//   async (
//     { walletId, data }: { walletId: string; data: { name: string } },
//     { rejectWithValue }
//   ) => {
//     // dispatch({ type: WALLET_PROCESSING_START })

//     try {
//       const walletDb =
//         await AccountManager.getInstance().context?.openDatastore(
//           WALLET_SCHEMA_0_2_0_URI
//         )

//       const row = await walletDb?.get(walletId)

//       row.label = data.name

//       await walletDb.save(row)

//       // TODO: find and update the wallet label in the store

//       // if (hdWallets) {
//       // const chains = selectChains(getState())
//       // const wallets = rawDataToReduxState(hdWallets, chains)
//       // dispatch(saveUserWallets(wallets))
//       // await SecureStore.setItemAsync(
//       //   CONFIG.WALLETS_STORAGE_KEY,
//       //   JSON.stringify(wallets)
//       // )
//       // }

//       // dispatch({ type: WALLET_PROCESSING_FINISHED })

//       await AccountManager.getInstance().restoreUserWallet(false)
//       // dispatch({ type: WALLET_PROCESSING_FINISHED })
//     } catch (error) {
//       // dispatch({
//       //   type: WALLET_PROCESSING_FAILED,
//       //   error: error,
//       // })
//       rejectWithValue('Could not rename wallet')
//     }
//   }
// )
