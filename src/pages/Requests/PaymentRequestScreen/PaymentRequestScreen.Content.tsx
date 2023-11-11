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
  getAggregateWalletBannerBalanceResult,
  getChainIdParamsFromResourceParams,
  useAggregateWalletBannerBalances,
  useMaybeBlockchainAccountForResource,
} from 'features/cryptoWallet'
import { reduceProtocols } from 'features/protocols'
import { useTokenCalculator } from 'features/token'
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
      getCurrentValueStringAsFiatOrZero,
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

    const [maybeNativeAssetWalletBannerBalance] =
      getAggregateWalletBannerBalanceResult(
        useAggregateWalletBannerBalances({
          resource: chainId,
        })
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
              formattedAssetPrice={
                getCurrentValueStringAsCryptoOrZero()
                //asset?.price
                //  ? formatFiatCurrency(asset.price)
                //  : undefined
              }
              formattedFiatValue={
                getCurrentValueStringAsFiatOrZero()
                //asset?.price && amount !== null
                //  ? formatFiatCurrency(asset.price * amount)
                //  : undefined
              }
              chainLabel={data.blockchainNetwork.label}
              chainLogo={data.blockchainNetwork.icon}
              style={styles.valueContainer}
            />
            {!!maybeNativeAssetWalletBannerBalance && (
              <RequestPaymentFee
                feeAmount={predictedMaxTransactionFee.toNumber().toFixed()}
                // TODO: fix native asset
                feeSymbol={maybeNativeAssetWalletBannerBalance.symbol}
                formattedFiatValue={
                  'TODO format fee'
                  //estimatedFee && nativeAsset
                  //  ? formatFiatCurrency(
                  //      estimatedFee * nativeAsset.price
                  //    )
                  //  : undefined
                }
                style={styles.feeContainer}
              />
            )}

            {!!maybeBlockchainWallet && (
              <WalletSelectorButton
                logo={maybeBlockchainWallet.icon || data.blockchainNetwork.icon}
                label={maybeBlockchainWallet.label}
                address={maybeBlockchainWallet.address}
                formattedBalance={
                  'TODO format balance'
                  //asset
                  //  ? `${asset.balance.toFixed(
                  //      assetSignificantDecimals
                  //    )} ${asset.symbol}`
                  //  : undefined
                }
                alertType='error'
                alertContent={
                  'TODO format funds content'
                  //asset && amount !== null && asset.balance < amount
                  //  ? 'Insufficient funds'
                  //  : undefined
                }
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
                ? // TODO: typo in type definition
                  'processsing'
                : 'success'
            }
            title={
              maybeConfirmTransactionError
                ? 'Error!'
                : loading || !transactionConfirmation
                ? // TODO: typo in type definition
                  'Processing payment...'
                : 'Success!'
            }
            subtitle={
              maybeConfirmTransactionError
                ? 'Something went wrong. Please try again later.'
                : loading || !transactionConfirmation
                ? // TODO: typo in type definition
                  'Please wait a moment, we are transfering your payment.'
                : 'TODO transaction amount!'
              //status === 'processing'
              //  ? 'Please wait a moment, we are transfering your payment.'
              //  : status === 'success'
              //  ? asset && amount !== null
              //    ? `${String(amount)} ${
              //        asset.symbol
              //      } (${formatFiatCurrency(
              //        asset.price * amount
              //      )}) has been sent to ${name}!`
              //    : `Payment sent to ${name}!`
              //  : // : erroMessage || 'Something went wrong. Try again later.' // TODO: Try to display a useful message to users
              //    'Something went wrong. Try again later.'
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
