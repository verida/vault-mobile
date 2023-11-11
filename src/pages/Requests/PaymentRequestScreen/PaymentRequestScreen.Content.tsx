import BigDecimal from 'bignumber.js'
import { ChainId } from 'caip'
import {
  RequestDetails,
  RequestHeader,
  RequestMessage,
  RequestPaymentFee,
  RequestPaymentValue,
  StatusInfo,
  WalletSelectorButton,
} from 'components'
import { ethers } from 'ethers'
import {
  AggregateWalletBannerBalance,
  ConfirmTransactionCallbackResult,
  CryptoWalletRequest,
  CURRENCY_SYMBOLS,
  getAggregateWalletBannerBalanceResult,
  getChainIdParamsFromResourceParams,
  useAggregateWalletBannerBalances,
  useMaybeBlockchainAccountForResource,
} from 'features/cryptoWallet'
import { reduceProtocols } from 'features/protocols'
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

export const PaymentRequestScreenContent = React.memo(
  function PaymentRequestScreenContent({
    details,
    tokenCalculator: {
      getCurrentValueStringAsCryptoOrZero,
      hasSufficientBalance,
    },
    loading,
    predictedMaxTransactionFee,
    data,
    logo,
    maybeConfirmTransactionError,
    senderName,
    aggregateWalletBannerBalance,
    transactionConfirmation,
    isNotStarted,
  }: {
    readonly details: PaymentRequestScreenParams['details']
    readonly tokenCalculator: ReturnType<typeof useTokenCalculator>
    readonly loading: boolean
    readonly predictedMaxTransactionFee: ethers.BigNumber
    readonly data: CryptoWalletRequest<'pay'>
    readonly logo: string | null | undefined
    readonly maybeConfirmTransactionError: Error | undefined
    readonly senderName: string
    readonly transactionConfirmation: ConfirmTransactionCallbackResult | null
    readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
    readonly isNotStarted: boolean
  }): JSX.Element {
    const { resource } = aggregateWalletBannerBalance

    const styles = useThemeAwareStyle(createStyles)

    const [detailsOpen, setDetailsOpen] = React.useState<boolean>(false)

    const protocols = reduceProtocols(details.protocols, 16)

    const handleToggleDetails = React.useCallback(() => {
      setDetailsOpen((prevValue) => !prevValue)
    }, [])

    const chainId = React.useMemo(
      () => new ChainId(getChainIdParamsFromResourceParams(resource)),
      [resource]
    )

    const maybeBlockchainWallet = useMaybeBlockchainAccountForResource({
      resource,
    })

    const handleViewInExplorer = React.useCallback(() => {
      if (!transactionConfirmation) return

      const { transactionHash } = transactionConfirmation

      // TODO: generalize this
      const url = `${data.blockchainNetwork.explorerURL}/tx/${transactionHash}`
      Linking.openURL(url)
    }, [data.blockchainNetwork.explorerURL, transactionConfirmation])

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

    if (isNotStarted) {
      return (
        <>
          <RequestHeader
            senderName={senderName}
            avatar={logo || undefined}
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
          <React.Fragment>
            <RequestPaymentValue
              assetAmount={getCurrentValueStringAsCryptoOrZero()}
              assetSymbol={aggregateWalletBannerBalance.symbol}
              assetLogo={aggregateWalletBannerBalance.icon || undefined}
              formattedAssetPrice={`${
                maybeValuation
                  ? `${
                      CURRENCY_SYMBOLS[maybeValuation.currency]
                    }${new BigDecimal(
                      maybeValuation.conversionRate
                    ).decimalPlaces(2)}`
                  : ''
              }`}
              formattedFiatValue={maybeFormattedFiatValue}
              chainLabel={data.blockchainNetwork.label}
              chainLogo={data.blockchainNetwork.icon}
              style={styles.valueContainer}
            />
            {!!maybeNativeAssetWalletBannerBalance &&
              (() => {
                const { feeAmount, feeSymbol } =
                  convertPredictedTransactionFeeToString({
                    ...maybeNativeAssetWalletBannerBalance,
                    chainId,
                    predictedMaxTransactionFee,
                  })

                const maybeFiatTransactionFee =
                  convertFromCryptoIntegerToMaybeDecimalFiat({
                    integerCryptoAmount: String(predictedMaxTransactionFee),
                    aggregateWalletBannerBalance:
                      maybeNativeAssetWalletBannerBalance,
                  })

                return (
                  <RequestPaymentFee
                    feeAmount={feeAmount}
                    feeSymbol={feeSymbol}
                    formattedFiatSymbol={maybeFiatTransactionFee?.fiatSymbol}
                    formattedFiatValue={
                      maybeFiatTransactionFee?.fiatAmount || ''
                    }
                    style={styles.feeContainer}
                  />
                )
              })()}

            {!!maybeBlockchainWallet && (
              <WalletSelectorButton
                logo={maybeBlockchainWallet.icon || data.blockchainNetwork.icon}
                label={maybeBlockchainWallet.label}
                address={maybeBlockchainWallet.address}
                formattedBalance={`${convertFromCryptoIntegerToDecimal({
                  integerCryptoAmount: String(
                    aggregateWalletBannerBalance.balance
                  ),
                  decimals: aggregateWalletBannerBalance.decimals,
                  decimalPlaces: 3,
                })} ${aggregateWalletBannerBalance.symbol}`}
                alertType='error'
                alertContent={!hasSufficientBalance ? 'Insufficient funds' : ''}
                style={styles.walletSelectorButton}
              />
            )}
          </React.Fragment>
        </>
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
          {Boolean(transactionConfirmation) && (
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
