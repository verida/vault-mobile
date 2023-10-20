import {
  RequestDetails,
  RequestHeader,
  RequestMessage,
  RequestPaymentFee,
  RequestPaymentValue,
  StatusInfo,
} from 'components'
import {
  CryptoWalletRequest,
  getSelectedWalletById,
  getSignificantDigits,
  getTransactionParams,
  getTransactionParamsData,
  priceFormatter,
  selectSingleTokenData,
} from 'features/cryptoWallet'
import { getProtocolLabel, getProtocolLogo, Protocol } from 'features/protocols'
import { Logger } from 'features/telemetry'
import { useThemeAwareStyle } from 'hooks'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import { wait } from 'utils'

import Button from 'components/Button'
import { MainStackScreenProps } from 'navigation/types'
import { useAppSelector } from 'reduxStore/types'
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
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState(false)
    const [erroMessage, setErrorMessage] = useState<string | undefined>()
    const [success, setSuccess] = useState(false)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const styles = useThemeAwareStyle(createStyles)
    const insets = useSafeAreaInsets()

    const dispatch = useDispatch()

    // FIXME: NEAR native token is not recognised
    // `data.asset`, when native token, comes from the blockchain network definition (where NEAR slip44Reference is 397).
    // To get more info on the asset, we use the existing `selectSingleTokenData` which matches the assetId with the token list fetched for the wallet balances.

    const asset = useAppSelector((state) =>
      selectSingleTokenData(state, data.asset)
    )
    const nativeAsset = useAppSelector((state) =>
      selectSingleTokenData(state, data.blockchainNetwork.asset)
    )

    // const selectedWallet = useAppSelector((state) =>
    //   getSelectedWalletById(state)
    // )
    // TODO: Check selectedWallet is defined
    // const account = selectedWallet.accounts[data.blockchainNetwork.chainId]

    // logger.debug('account', { account })

    const transactionParams = useAppSelector((state) =>
      getTransactionParamsData(state)
    )
    // Get the estimated fee in the native asset
    const estimatedFee = transactionParams?.fee
      ? transactionParams?.fee / Math.pow(10, data.blockchainNetwork.decimal)
      : undefined

    // Get the number of significant decimal for the native asset (ie. the fraction of the native asset for which the value is above 0.01 cents)
    const significantQuantityDecimal = nativeAsset?.price
      ? getSignificantDigits(0.01 / nativeAsset?.price)
      : 3

    const handleToggleDetails = useCallback(() => {
      setDetailsOpen((prevValue) => !prevValue)
    }, [])

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handlePay = useCallback(async () => {
      setProcessing(true)
      await wait(2000)
      setSuccess(true)
      setProcessing(false)
      // TODO: Handle the case where the user closes the screen before the request is processed
    }, [])

    // Call Wallet Provider to get the transaction params
    useEffect(() => {
      if (!asset || transactionParamCalledRef.current) {
        return
      }
      logger.debug('Calling getTransactionParams')
      dispatch(
        getTransactionParams({
          token: asset,
          amount: String(data.amount),
          address: data.recipientAccount.address,
        })
      )
      transactionParamCalledRef.current = true
    }, [dispatch, transactionParams, asset, data])

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

    const protocols = details.protocols
      .map((protocol) => {
        const protocolLogo = getProtocolLogo(protocol, 16)
        const protocolLabel = getProtocolLabel(protocol)
        return (
          <>
            {protocolLogo} {protocolLabel}
          </>
        )
      })
      .reduce((prev, curr) => (
        <>
          {prev}
          {', '}
          {curr}
        </>
      ))

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
            {!processing && !error && !success ? (
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
                {asset ? (
                  <>
                    <RequestPaymentValue
                      assetAmount={String(
                        data.amount / Math.pow(10, asset.token.decimal)
                      )}
                      assetSymbol={asset.symbol}
                      assetLogo={asset.token.icon}
                      formattedAssetPrice={priceFormatter(asset.price)}
                      formattedFiatValue={priceFormatter(
                        (asset.price * data.amount) /
                          Math.pow(10, asset.token.decimal)
                      )}
                      chainLabel={data.blockchainNetwork.label}
                      chainLogo={data.blockchainNetwork.icon}
                      style={styles.valueContainer}
                    />
                    <RequestPaymentFee
                      feeAmount={
                        estimatedFee
                          ? estimatedFee.toFixed(significantQuantityDecimal)
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
                  </>
                ) : (
                  <View>
                    <Text>Requested asset not found</Text>
                  </View>
                )}
                {/* TODO: Add wallet */}
              </>
            ) : (
              // TODO: Implement the design from Figma (success display the request with an 'Accepted' banner and display the data item)
              <StatusInfo
                style={styles.statusContainer}
                statusType={
                  processing ? 'processsing' : success ? 'success' : 'error'
                }
                title={
                  processing
                    ? 'Processing payment...'
                    : success
                    ? 'Success!'
                    : 'Error!'
                }
                subtitle={
                  processing
                    ? 'Please wait a moment, we are transfering your payment.'
                    : success
                    ? `You have successfully paid ${name}!`
                    : erroMessage || 'Something went wrong. Try again later.'
                }
              />
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerActionsContainer}>
              {/* TODO: Ensure the buttons have a background */}
              {processing || error || success ? (
                <>
                  <Button
                    onPress={handleClose}
                    style={styles.actionButton}
                    disabled={processing}>
                    Close
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onPress={handleClose}
                    color='grey'
                    disabled={processing}
                    style={[styles.actionButton, styles.mr]}>
                    Decline
                  </Button>
                  <Button
                    onPress={handlePay}
                    disabled={processing}
                    style={[styles.actionButton, styles.ml]}>
                    Pay
                  </Button>
                </>
              )}
            </View>
          </View>
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
    statusContainer: {
      marginTop: 104,
    },
    footer: {
      backgroundColor: theme.color.background,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.sm,
      borderTopColor: theme.color.lightGrey,
      borderTopWidth: 1,
    },
    footerActionsContainer: {
      flexDirection: 'row',
    },
    actionButton: {
      flex: 1,
      marginBottom: 0,
    },
    mr: {
      marginRight: 10,
    },
    ml: {
      marginLeft: 10,
    },
  })
