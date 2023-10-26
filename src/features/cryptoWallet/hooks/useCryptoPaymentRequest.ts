import {
  CryptoWalletRequest,
  SentTransaction,
  TransactionData,
} from 'features/cryptoWallet/@types'
import {
  getSelectedWalletById,
  getTransactionParams,
  getTransactionParamsData,
  selectSingleTokenData,
  sendTransaction,
} from 'features/cryptoWallet/slice'
import {
  getSignificantDigits,
  isWatchedWallet,
} from 'features/cryptoWallet/utils'
import { Logger } from 'features/telemetry'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'reduxStore/types'

const logger = new Logger('CryptoWallet')

export function useCryptoPaymentRequest(request: CryptoWalletRequest<'pay'>) {
  const transactionParamCalledRef = useRef(false)
  const [status, setStatus] = useState<
    'notStarted' | 'processing' | 'error' | 'success'
  >('notStarted')
  const [sentTransaction, setSentTransaction] =
    useState<SentTransaction | null>(null)
  const dispatch = useAppDispatch()

  // FIXME: NEAR native token is not recognised
  // `data.asset`, when native token, comes from the blockchain network definition (where NEAR slip44Reference is 397).
  // To get more info on the asset, we use the existing `selectSingleTokenData` which matches the assetId with the token list fetched for the wallet balances.

  const asset = useAppSelector((state) =>
    selectSingleTokenData(state, request.asset)
  )
  const nativeAsset = useAppSelector((state) =>
    selectSingleTokenData(state, request.blockchainNetwork.asset)
  )

  // Get the number of significant decimal for the assets (ie. the fraction of the asset for which the value is above 0.01 cents)
  const assetSignificantDecimals = asset?.price
    ? getSignificantDigits(0.01 / asset.price, 2, 8, 2)
    : 2
  const nativeAssetSignificantDecimals = nativeAsset?.price
    ? getSignificantDigits(0.01 / nativeAsset.price, 2, 8, 2)
    : 2

  const selectedWallet = useAppSelector((state) => getSelectedWalletById(state))

  const account = selectedWallet?.accounts[request.blockchainNetwork.chainId]
  const isAccountValid = !isWatchedWallet(account)

  const transactionParams = useAppSelector((state) =>
    getTransactionParamsData(state)
  )

  const amount = asset?.token.decimal
    ? request.amount / Math.pow(10, asset.token.decimal)
    : null

  // Get the estimated fee in the native asset
  const estimatedFee = transactionParams?.fee
    ? transactionParams?.fee / Math.pow(10, request.blockchainNetwork.decimal)
    : null

  const transactionData: TransactionData | null = useMemo(() => {
    if (!asset || !amount || !request.recipientAccount.address) {
      return null
    }

    return {
      token: asset,
      amount: String(amount),
      address: request.recipientAccount.address,
      disableNavigate: true,
    }
  }, [asset, amount, request.recipientAccount.address])

  // Call Wallet Provider to get the transaction params
  useEffect(() => {
    if (!transactionData || transactionParamCalledRef.current) {
      return
    }
    try {
      dispatch(getTransactionParams(transactionData))
    } catch (error: unknown) {
      logger.error(
        new Error('Failed to get transaction params', {
          cause: error,
        })
      )
    }
    transactionParamCalledRef.current = true
  }, [dispatch, transactionParams, transactionData, asset])

  const isReady = isAccountValid && !!transactionParams && !!transactionData

  const processPayment = useCallback(async () => {
    if (!isReady) {
      return
    }

    setStatus('processing')
    try {
      const result = await dispatch(
        sendTransaction({
          transactionData,
        })
      )
      if (result.meta.requestStatus === 'rejected') {
        setStatus('error')
        logger.error(
          new Error('Crypto payment failed', {
            cause:
              typeof result.payload === 'string'
                ? new Error(result.payload)
                : undefined,
          })
        )
        return
      }
      setSentTransaction(result.payload as SentTransaction) // TODO: Have to type 'sendTransaction' to avoid this assertion
      setStatus('success')
    } catch (cause: unknown) {
      setStatus('error')
      logger.error(new Error('Failed to send transaction', { cause }))
    }
    // TODO: Handle the case where the user closes the screen before the request is processed
  }, [dispatch, isReady, transactionData])

  return {
    account,
    amount,
    asset,
    assetSignificantDecimals,
    estimatedFee,
    isReady,
    nativeAsset,
    nativeAssetSignificantDecimals,
    processPayment,
    selectedWallet,
    sentTransaction,
    status,
  }
}
