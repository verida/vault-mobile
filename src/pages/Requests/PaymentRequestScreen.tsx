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
  priceFormatter,
  useCryptoPaymentRequest,
} from 'features/cryptoWallet'
import { Protocol, reduceProtocols } from 'features/protocols'
import { useThemeAwareStyle } from 'hooks'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
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
import { Theme } from 'styles/types'

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

    const [detailsOpen, setDetailsOpen] = useState(false)
    const {
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
    } = useCryptoPaymentRequest(data)

    const styles = useThemeAwareStyle(createStyles)
    const insets = useSafeAreaInsets()

    const handleToggleDetails = useCallback(() => {
      setDetailsOpen((prevValue) => !prevValue)
    }, [])

    const handleClose = useCallback(() => {
      navigation.goBack()
    }, [navigation])

    const handleViewInExplorer = useCallback(() => {
      if (!sentTransaction?.id) {
        return
      }
      const url = `${data.blockchainNetwork.explorerURL}/tx/${sentTransaction?.id}`
      Linking.openURL(url)
    }, [data.blockchainNetwork.explorerURL, sentTransaction])

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
                      onPress: processPayment,
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
