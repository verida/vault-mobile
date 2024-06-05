import { ethers } from 'ethers'
import * as React from 'react'
import { Linking, StyleSheet, View } from 'react-native'

import {
  RequestHeaderProps,
  StatusInfo,
  useMaybeWalletSelectorButtonProps,
} from '~/components'
import Button from '~/components/Button'
import {
  AggregateWalletBannerBalance,
  ConfirmTransactionCallbackResult,
  useChainIdForResourceParams,
  useMaybeChainMetadataExplorerUrl,
  useMaybeChainMetadataForResource,
} from '~/features/cryptoWallet'
import { useTokenCalculator } from '~/features/token'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

import type { PaymentRequestScreenParams } from './'
import { PaymentRequestScreenContentBody } from './PaymentRequestScreen.Content.Body'

export const PaymentRequestScreenContent = React.memo(
  function PaymentRequestScreenContent({
    integerCryptoAmount,
    details,
    loading,
    predictedMaxTransactionFee,
    maybeConfirmTransactionError,
    aggregateWalletBannerBalance,
    transactionConfirmation,
    isNotStarted,
    detailsOpen,
    requestHeaderProps,
  }: {
    readonly integerCryptoAmount: `${number}`
    readonly details: PaymentRequestScreenParams['details']
    readonly tokenCalculator: ReturnType<typeof useTokenCalculator>
    readonly loading: boolean
    readonly predictedMaxTransactionFee: ethers.BigNumber
    readonly maybeConfirmTransactionError: Error | undefined
    readonly transactionConfirmation: ConfirmTransactionCallbackResult | null
    readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
    readonly isNotStarted: boolean
    readonly detailsOpen: boolean
    readonly requestHeaderProps: Omit<
      RequestHeaderProps,
      'timestamp' | 'isDetailsOpen'
    >
  }): JSX.Element {
    const { resource } = aggregateWalletBannerBalance

    const { senderName } = requestHeaderProps

    const styles = useThemeAwareStyle(createStyles)

    const chainId = useChainIdForResourceParams({ resource })

    const maybeChainMetadata = useMaybeChainMetadataForResource({ resource })

    const maybeBlockchainExplorerUrl = useMaybeChainMetadataExplorerUrl({
      chainMetadata: maybeChainMetadata,
      transactionHash: transactionConfirmation?.transactionHash,
    })

    const handleViewInExplorer = React.useCallback(() => {
      if (!maybeBlockchainExplorerUrl) return

      Linking.openURL(maybeBlockchainExplorerUrl)
    }, [maybeBlockchainExplorerUrl])

    // TODO: embed this in wallet selector
    const maybeWalletSelectorButtonProps = useMaybeWalletSelectorButtonProps({
      aggregateWalletBannerBalance,
      resource: chainId,
    })

    if (isNotStarted) {
      // Describes how to convert between a whole unit of an asset, i.e. 1 ETH,
      // and the base currency.
      const { valuation: maybeValuation } = aggregateWalletBannerBalance

      return (
        <PaymentRequestScreenContentBody
          details={details}
          detailsOpen={detailsOpen}
          requestHeaderProps={requestHeaderProps}
          requestPaymentValueProps={{
            aggregateWalletBannerBalance,
            integerCryptoAmount,
            chainMetadata: maybeChainMetadata || undefined,
          }}
          requestPaymentFeeProps={
            maybeChainMetadata
              ? {
                  chainMetadata: maybeChainMetadata,
                  predictedMaxTransactionFee,
                  detailedValuation: maybeValuation,
                }
              : null
          }
          walletSelectorButtonProps={maybeWalletSelectorButtonProps}
        />
      )
    } else {
      return (
        // TODO: Implement the design from Figma (success display the request with an 'Accepted' banner and display the data item)
        <>
          <StatusInfo
            style={styles.statusContainer}
            statusType={
              maybeConfirmTransactionError
                ? 'error'
                : loading || !transactionConfirmation
                  ? 'processsing'
                  : 'success'
            }
            title={
              maybeConfirmTransactionError
                ? 'Error!'
                : loading || !transactionConfirmation
                  ? 'Processing payment...'
                  : 'Success!'
            }
            subtitle={
              maybeConfirmTransactionError
                ? 'Something went wrong. Please try again later.'
                : loading || !transactionConfirmation
                  ? 'Please wait a moment, we are transferring your payment.'
                  : `${
                      // TODO: This prop needs to be refactored to accept a JSX.Element
                      //       instead of a string:
                      'Payment'
                      //maybeFormattedFiatValue
                      //  ? maybeFormattedFiatValue
                      //  : 'Payment'
                    } sent to ${senderName}!`
            }
          />
          {Boolean(maybeBlockchainExplorerUrl && transactionConfirmation) && (
            <View style={styles.viewInExplorerButtonWrapper}>
              <Button
                onPress={handleViewInExplorer}
                color='grey'
                style={[styles.actionButton]}>
                View in Blockchain Explorer
              </Button>
            </View>
          )}
        </>
      )
    }
  }
)

// TODO: Use the theme when proper typography is available
const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
