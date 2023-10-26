import {
  BottomActionBar,
  RequestDetails,
  RequestHeader,
  RequestMessage,
  RequestPaymentFee,
  RequestPaymentValue,
  StatusInfo,
  WalletSelectorButton,
} from 'components'
import {
  CryptoWalletRequest,
  getSelectedWalletById,
  getSignificantDigits,
  getTransactionParams,
  getTransactionParamsData,
  priceFormatter,
  selectSingleTokenData,
  sendTransaction,
  SentTransaction,
  TransactionData,
} from 'features/cryptoWallet'
import { Protocol, reduceProtocols } from 'features/protocols'
import { Logger } from 'features/telemetry'
import { useThemeAwareStyle } from 'hooks'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Button from 'components/Button'
import { MainStackScreenProps } from 'navigation/types'
import { useAppDispatch, useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

const logger = new Logger('PaymentRequestScreen')

export interface PaymentRequestScreenParams {
  name: string
  logo?: string
  details: {
    timestamp?: string
    requesterId: string
    message?: string
    url?: string
    protocols: Protocol[]
  }
  data: CryptoWalletRequest<'pay'>
}

type PaymentRequestScreenProps = MainStackScreenProps<'PaymentRequest'>

export const PaymentRequestScreen: React.FunctionComponent<PaymentRequestScreenProps> =
  (props) => {
    const { navigation, route } = props
    const { name, logo, details, data } = route.params

    const transactionParamCalledRef = useRef(false)
    const [status, setStatus] = useState<
      'notStarted' | 'processing' | 'error' | 'success'
    >('notStarted')
    const [sentTransaction, setSentTransaction] =
      useState<SentTransaction | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const styles = useThemeAwareStyle(createStyles)
    const insets = useSafeAreaInsets()

    const dispatch = useAppDispatch()

    // FIXME: NEAR native token is not recognised
    // `data.asset`, when native token, comes from the blockchain network definition (where NEAR slip44Reference is 397).
    // To get more info on the asset, we use the existing `selectSingleTokenData` which matches the assetId with the token list fetched for the wallet balances.

    const asset = useAppSelector((state) =>
      selectSingleTokenData(state, data.asset)
    )
    const nativeAsset = useAppSelector((state) =>
      selectSingleTokenData(state, data.blockchainNetwork.asset)
    )

    // Get the number of significant decimal for the assets (ie. the fraction of the asset for which the value is above 0.01 cents)
    const nativeAssetSignificantDecimals = nativeAsset?.price
      ? getSignificantDigits(0.01 / nativeAsset.price, 2, 8, 2)
      : 2
    const assetSignificantDecimals = asset?.price
      ? getSignificantDigits(0.01 / asset.price, 2, 8, 2)
      : 2

    const selectedWallet = useAppSelector((state) =>
      getSelectedWalletById(state)
    )

    const account = selectedWallet?.accounts[data.blockchainNetwork.chainId]

    const transactionParams = useAppSelector((state) =>
      getTransactionParamsData(state)
    )

    const amount = asset?.token.decimal
      ? data.amount / Math.pow(10, asset.token.decimal)
      : null

    // Get the estimated fee in the native asset
    const estimatedFee = transactionParams?.fee
      ? transactionParams?.fee / Math.pow(10, data.blockchainNetwork.decimal)
      : undefined

    const transactionData: TransactionData | null = useMemo(() => {
      if (!asset || !amount || !data.recipientAccount.address) {
        return null
      }

      return {
        token: asset,
        amount: String(amount),
        address: data.recipientAccount.address,
      }
    }, [asset, amount, data.recipientAccount.address])

    const isReady = !!transactionParams && !!transactionData

    const handleToggleDetails = useCallback(() => {
      setDetailsOpen((prevValue) => !prevValue)
    }, [])

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handlePressPay = useCallback(async () => {
      if (!transactionData) {
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
          // setErrorMessage(result.meta.requestError.message)
          return
        }
        setSentTransaction(result.payload as SentTransaction) // TODO: Have to type 'sendTransaction' to avoid this assertion
        setStatus('success')
      } catch (cause: unknown) {
        setStatus('error')
        logger.error(cause)
      }
      // TODO: Handle the case where the user closes the screen before the request is processed
    }, [dispatch, transactionData])

    const handleViewInExplorer = useCallback(() => {
      if (!sentTransaction?.id) {
        return
      }
      const url = `${data.blockchainNetwork.explorerURL}/tx/${sentTransaction?.id}`
      Linking.openURL(url)
    }, [data.blockchainNetwork.explorerURL, sentTransaction])

    // Call Wallet Provider to get the transaction params
    useEffect(() => {
      if (!transactionData || transactionParamCalledRef.current) {
        return
      }
      logger.debug('Calling getTransactionParams')
      dispatch(getTransactionParams(transactionData))
      transactionParamCalledRef.current = true
    }, [dispatch, transactionParams, transactionData, asset])

    // Set the content of the screen header
    useEffect(() => {
      navigation.setOptions({
        title: 'Payment Request',
        // TODO: Get rid of the following when properly handling a common header in the navigator
        headerRight: () => (
          // TODO: Get rid of native-base when we have proper base components (button, icon, etc.)
          <ButtonNativeBase transparent onPress={handleClose}>
            <IconNativeBase name='close' style={{ color: '#000' }} />
          </ButtonNativeBase>
        ),
      })
    }, [navigation, handleClose])

    const protocols = reduceProtocols(details.protocols, 16)

    return (
      <>
        <StatusBar barStyle='light-content' />
        <View
          style={[
            styles.wrapper,
            {
              paddingBottom: insets.bottom,
              paddingRight: insets.right,
              paddingLeft: insets.left,
            },
          ]}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.containerContent}>
            {status === 'notStarted' ? (
              <>
                <RequestHeader
                  senderName={name}
                  avatar={logo}
                  timestamp={details.timestamp}
                  isDetailsOpen={detailsOpen}
                  onToggleDetails={handleToggleDetails}
                />
                {detailsOpen ? (
                  <RequestDetails
                    properties={[
                      {
                        label: 'Recipient address',
                        value: details.requesterId,
                      },
                      {
                        label: 'Protocols',
                        value: <>{protocols}</>,
                      },
                    ]}
                    style={styles.detailsContainer}
                  />
                ) : null}
                {details.message ? (
                  <RequestMessage style={styles.messageContainer}>
                    {details.message}
                  </RequestMessage>
                ) : null}
                {asset && amount ? (
                  <>
                    <RequestPaymentValue
                      assetAmount={String(amount)}
                      assetSymbol={asset.symbol}
                      assetLogo={asset.token.icon}
                      formattedAssetPrice={priceFormatter(asset.price)}
                      formattedFiatValue={priceFormatter(asset.price * amount)}
                      chainLabel={data.blockchainNetwork.label}
                      chainLogo={data.blockchainNetwork.icon}
                      style={styles.valueContainer}
                    />
                    <RequestPaymentFee
                      feeAmount={
                        estimatedFee
                          ? estimatedFee.toFixed(nativeAssetSignificantDecimals)
                          : undefined
                      }
                      feeSymbol={nativeAsset?.symbol}
                      formattedFiatValue={
                        estimatedFee && nativeAsset
                          ? priceFormatter(estimatedFee * nativeAsset.price)
                          : undefined
                      }
                      style={styles.feeContainer}
                    />
                    {selectedWallet && account ? (
                      <WalletSelectorButton
                        logo={
                          selectedWallet.icon || data.blockchainNetwork.icon
                        }
                        label={selectedWallet.label}
                        address={account.address}
                        formattedBalance={`${asset.balance.toFixed(
                          assetSignificantDecimals
                        )} ${asset.symbol}`}
                        alertType='error'
                        alertContent={
                          asset.balance < amount
                            ? 'Insufficient funds'
                            : undefined
                        }
                        style={styles.walletSelectorButton}
                      />
                    ) : null}
                  </>
                ) : (
                  <View>
                    {/* TODO: Handle unsupported case */}
                    <Text>Requested asset not found</Text>
                  </View>
                )}
              </>
            ) : (
              // TODO: Implement the design from Figma (success display the request with an 'Accepted' banner and display the data item)
              <>
                <StatusInfo
                  style={styles.statusContainer}
                  statusType={
                    status === 'processing'
                      ? 'processsing'
                      : status === 'success'
                      ? 'success'
                      : 'error'
                  }
                  title={
                    status === 'processing'
                      ? 'Processing payment...'
                      : status === 'success'
                      ? 'Success!'
                      : 'Error!'
                  }
                  subtitle={
                    status === 'processing'
                      ? 'Please wait a moment, we are transfering your payment.'
                      : status === 'success'
                      ? asset && amount
                        ? `${String(amount)} ${asset.symbol} (${priceFormatter(
                            asset.price * amount
                          )}) has been sent to ${name}!`
                        : `Payment sent to ${name}!`
                      : // : erroMessage || 'Something went wrong. Try again later.' // TODO: Try to display a useful message to users
                        'Something went wrong. Try again later.'
                  }
                />
                {sentTransaction && status === 'success' ? (
                  <View style={styles.viewInExplorerButtonWrapper}>
                    <Button
                      onPress={handleViewInExplorer}
                      color='grey'
                      style={[styles.actionButton]}>
                      View in Blockchain Explorer
                    </Button>
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>

          <BottomActionBar
            alertType='warning'
            alertContent={
              isReady ? undefined : 'Checking some blockchain parameters'
            }
            actions={
              status === 'notStarted'
                ? [
                    {
                      label: 'Decline',
                      onPress: handleClose,
                      color: 'grey',
                    },
                    {
                      label: 'Pay',
                      onPress: handlePressPay,
                      disabled: !isReady,
                    },
                  ]
                : [
                    {
                      label: 'Close',
                      onPress: handleClose,
                      disabled: status === 'processing',
                    },
                  ]
            }
          />
        </View>
      </>
    )
  }

// TODO: Use the theme when proper typography is available
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    container: {
      flex: 1,
    },
    containerContent: {
      paddingVertical: theme.spacing.l,
      paddingHorizontal: theme.spacing.m,
    },
    detailsContainer: {
      marginTop: theme.spacing.m,
    },
    messageContainer: {
      marginTop: theme.spacing.l,
    },
    valueContainer: {
      marginTop: theme.spacing.xl,
    },
    feeContainer: {
      marginTop: theme.spacing.l,
    },
    walletSelectorButton: {
      marginTop: theme.spacing.l,
    },
    statusContainer: {
      marginTop: 104,
    },
    viewInExplorerButtonWrapper: {
      marginTop: theme.spacing.l,
    },
    actionButton: {
      flex: 1,
      marginBottom: 0,
    },
  })
