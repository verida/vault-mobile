import BigDecimal from 'bignumber.js'
import {
  RequestHeaderProps,
  RequestPaymentFeeProps,
  StatusInfo,
  useMaybeWalletSelectorButtonProps,
} from 'components'
import { ethers } from 'ethers'
import {
  AggregateWalletBannerBalance,
  ConfirmTransactionCallbackResult,
  CryptoWalletRequest,
  CURRENCY_SYMBOLS,
  getAggregateWalletBannerBalanceResult,
  useAggregateWalletBannerBalances,
  useChainIdForResourceParams,
  useMaybeChainMetadataExplorerUrl,
  useMaybeChainMetadataForResource,
} from 'features/cryptoWallet'
import {
  convertFromCryptoIntegerToDecimal,
  convertFromCryptoIntegerToMaybeDecimalFiat,
  convertPredictedTransactionFeeToString,
  useTokenCalculator,
} from 'features/token'
import { useThemeAwareStyle } from 'hooks'
import * as React from 'react'
import { Linking, StyleSheet, View } from 'react-native'

import Button from 'components/Button'
import { Theme } from 'styles/types'

import type { PaymentRequestScreenParams } from './'
import { PaymentRequestScreenContentBody } from './PaymentRequestScreen.Content.Body'

export const PaymentRequestScreenContent = React.memo(
  function PaymentRequestScreenContent({
    details,
    tokenCalculator: { getCurrentValueStringAsCryptoOrZero },
    loading,
    predictedMaxTransactionFee,
    data,
    maybeConfirmTransactionError,
    aggregateWalletBannerBalance,
    transactionConfirmation,
    isNotStarted,
    detailsOpen,
    requestHeaderProps,
  }: {
    readonly details: PaymentRequestScreenParams['details']
    readonly tokenCalculator: ReturnType<typeof useTokenCalculator>
    readonly loading: boolean
    readonly predictedMaxTransactionFee: ethers.BigNumber
    readonly data: CryptoWalletRequest<'pay'>
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

    // Describes how to convert between a whole unit of an asset, i.e. 1 ETH,
    // and the base currency.
    const { valuation: maybeValuation } = aggregateWalletBannerBalance

    const maybeFiatPaymentAmount = convertFromCryptoIntegerToMaybeDecimalFiat({
      integerCryptoAmount: String(data.amount),
      aggregateWalletBannerBalance,
    })

    const maybeFormattedFiatValue = maybeFiatPaymentAmount
      ? `${maybeFiatPaymentAmount.fiatSymbol}${maybeFiatPaymentAmount.fiatAmount}`
      : undefined

    const [maybeNativeAssetWalletBannerBalance] =
      getAggregateWalletBannerBalanceResult(
        useAggregateWalletBannerBalances({
          resource: chainId,
        })
      )

    const maybeWalletSelectorButtonProps = useMaybeWalletSelectorButtonProps({
      resource: chainId,
      formattedBalance: `${convertFromCryptoIntegerToDecimal({
        integerCryptoAmount: String(aggregateWalletBannerBalance.balance),
        decimals: aggregateWalletBannerBalance.decimals,
        decimalPlaces: 3,
      })} ${aggregateWalletBannerBalance.symbol}`,
    })

    if (isNotStarted) {
      return (
        <PaymentRequestScreenContentBody
          details={details}
          detailsOpen={detailsOpen}
          requestHeaderProps={requestHeaderProps}
          requestPaymentValueProps={{
            assetAmount: getCurrentValueStringAsCryptoOrZero(),
            assetSymbol: aggregateWalletBannerBalance.symbol,
            assetLogo: aggregateWalletBannerBalance.icon || undefined,
            formattedAssetPrice: `${
              maybeValuation
                ? `${CURRENCY_SYMBOLS[maybeValuation.currency]}${new BigDecimal(
                    maybeValuation.conversionRate
                  ).decimalPlaces(2)}`
                : ''
            }`,
            formattedFiatValue: maybeFormattedFiatValue,
            chainLabel: maybeNativeAssetWalletBannerBalance?.label,
            chainLogo: maybeNativeAssetWalletBannerBalance?.icon || undefined,
          }}
          requestPaymentFeeProps={
            maybeNativeAssetWalletBannerBalance && maybeChainMetadata
              ? ((): Omit<RequestPaymentFeeProps, 'style'> => {
                  const { feeAmount, feeSymbol } =
                    convertPredictedTransactionFeeToString({
                      chainMetadata: maybeChainMetadata,
                      predictedMaxTransactionFee,
                    })

                  const maybeFiatTransactionFee =
                    convertFromCryptoIntegerToMaybeDecimalFiat({
                      integerCryptoAmount: String(predictedMaxTransactionFee),
                      aggregateWalletBannerBalance:
                        maybeNativeAssetWalletBannerBalance,
                    })

                  return {
                    feeAmount,
                    feeSymbol,
                    formattedFiatSymbol: maybeFiatTransactionFee?.fiatSymbol,
                    formattedFiatValue:
                      maybeFiatTransactionFee?.fiatAmount || '',
                  }
                })()
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
                    maybeFormattedFiatValue
                      ? maybeFormattedFiatValue
                      : 'Payment'
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
