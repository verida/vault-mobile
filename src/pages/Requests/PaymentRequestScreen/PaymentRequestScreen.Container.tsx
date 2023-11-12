import { AlertType, BottomActionBar } from 'components'
import {
  AggregateWalletBannerBalance,
  ConfirmTransactionCallbackResult,
  useChainIdForResourceParams,
  useLazyConfirmTransaction,
} from 'features/cryptoWallet'
import {
  convertFromCryptoIntegerToDecimal,
  usePredictMaxTransactionFeeOrZero,
  useTokenCalculator,
} from 'features/token'
import { useThemeAwareStyle } from 'hooks'
import * as React from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import { Theme } from 'styles/types'

import type { PaymentRequestScreenParams } from '.'
import { PaymentRequestScreenContent } from './PaymentRequestScreen.Content'

export const PaymentRequestScreenContainer = React.memo(
  function PaymentRequestScreenContainer({
    name: senderName,
    logo,
    details,
    data,
    aggregateWalletBannerBalance,
    onRequestClose,
  }: PaymentRequestScreenParams & {
    readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
    readonly onRequestClose: () => void
  }): JSX.Element {
    const { resource, amount: integerAmount, recipientAccount } = data

    const { address: toAddress } = recipientAccount

    const [transactionConfirmation, setTransactionConfirmation] =
      React.useState<ConfirmTransactionCallbackResult | null>(null)

    // TODO: wait for transaction confrimation state etc
    const lazyConfirmTransaction = useLazyConfirmTransaction()
    const { loading, confirmTransaction } = lazyConfirmTransaction

    const maybeConfirmTransactionError =
      'error' in lazyConfirmTransaction
        ? lazyConfirmTransaction.error
        : undefined

    const isNotStarted = !loading && !transactionConfirmation

    const styles = useThemeAwareStyle(createStyles)

    const chainId = useChainIdForResourceParams({ resource })

    const predictedMaxTransactionFee = usePredictMaxTransactionFeeOrZero({
      chainId,
    })

    const { decimals } = aggregateWalletBannerBalance

    // HACK: The value passed to us is in an integer unit, i.e. wei, but
    //       TokenCalculator works using decimal representation, i.e. in ETH.
    const initialValue = convertFromCryptoIntegerToDecimal({
      integerCryptoAmount: String(integerAmount),
      decimals,
    })

    const tokenCalculator = useTokenCalculator({
      initialValue,
      aggregateWalletBannerBalance,
      predictedMaxTransactionFee,
    })

    const {
      getCurrentValueStringAsCryptoOrZero,
      isNotMalformed,
      hasSufficientBalance,
      canExecutePayment,
    } = tokenCalculator

    const processPaymentAsync = React.useCallback(async () => {
      if (!aggregateWalletBannerBalance)
        throw new Error(
          `Exepcted WalletBannerBalance, encountered "${String(
            aggregateWalletBannerBalance
          )}".`
        )

      if (typeof toAddress !== 'string' || !toAddress.length)
        throw new Error(`Invalid toAddress, "${String(toAddress)}".`)

      const amount = parseFloat(getCurrentValueStringAsCryptoOrZero())

      if (amount <= 0 || isNaN(amount))
        throw new Error(`Invalid amount (${amount}).`)

      setTransactionConfirmation(
        await confirmTransaction({
          aggregateWalletBannerBalance,
          toAddress,
          amount,
        })
      )
    }, [
      aggregateWalletBannerBalance,
      confirmTransaction,
      getCurrentValueStringAsCryptoOrZero,
      setTransactionConfirmation,
      toAddress,
    ])

    // TODO: capture pay error
    const onPressPay = React.useCallback(
      // eslint-disable-next-line no-void
      () => void processPaymentAsync(),
      [processPaymentAsync]
    )

    const alertMessage = false
      ? {
          type: 'error',
          message: 'The requested asset has not been found!',
        }
      : !hasSufficientBalance
      ? {
          type: 'error',
          message: 'Insufficient balance.',
        }
      : !isNotMalformed
      ? {
          type: 'error',
          message: 'The requested amount is not valid!',
        }
      : undefined

    return (
      <React.Fragment>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.containerContent}>
          <PaymentRequestScreenContent
            details={details}
            tokenCalculator={tokenCalculator}
            loading={loading}
            data={data}
            predictedMaxTransactionFee={predictedMaxTransactionFee}
            logo={logo}
            senderName={senderName}
            maybeConfirmTransactionError={maybeConfirmTransactionError}
            aggregateWalletBannerBalance={aggregateWalletBannerBalance}
            transactionConfirmation={transactionConfirmation}
            isNotStarted={isNotStarted}
          />
        </ScrollView>
        <BottomActionBar
          alertType={alertMessage?.type as AlertType | undefined}
          alertContent={alertMessage?.message}
          actions={
            isNotStarted
              ? [
                  {
                    label: 'Decline',
                    onPress: onRequestClose,
                    color: 'grey',
                  },
                  {
                    label: 'Pay',
                    onPress: onPressPay,
                    disabled: !canExecutePayment,
                  },
                ]
              : [
                  {
                    label: 'Close',
                    onPress: onRequestClose,
                    disabled: loading,
                  },
                ]
          }
        />
      </React.Fragment>
    )
  }
)

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
  })
