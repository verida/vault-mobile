import React, { useCallback, useEffect } from 'react'
import { Alert, StyleSheet, View } from 'react-native'

import { BottomActionBar, ScreenWrapper } from '~/components'
import TokenCalculator from '~/components/Tokens/TokenCalculator'
import {
  AggregateWalletBannerBalance,
  useChainIdForResourceParams,
} from '~/features/cryptoWallet'
import {
  usePredictMaxTransactionFeeOrZero,
  useTokenCalculator,
} from '~/features/token'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

const showAlert = () =>
  Alert.alert('Invalid quantity', 'Quantity is higher than wallet balance')

export type SendTokenScreenParams = {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

type SendTokenScreenProps = MainStackScreenProps<'SendToken'>

export const SendTokenScreen: React.FC<SendTokenScreenProps> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const { aggregateWalletBannerBalance } = params

  useEffect(() => {
    navigation.setOptions({
      title: `Send ${aggregateWalletBannerBalance.symbol}`,
    })
  }, [navigation, aggregateWalletBannerBalance])

  const { resource } = aggregateWalletBannerBalance

  const chainId = useChainIdForResourceParams({ resource })

  const predictedMaxTransactionFee = usePredictMaxTransactionFeeOrZero({
    chainId,
  })

  const tokenCalculatorProps = useTokenCalculator({
    aggregateWalletBannerBalance,
    predictedMaxTransactionFee,
  })

  const { canExecutePayment, getCurrentValueStringAsCryptoOrZero } =
    tokenCalculatorProps

  const handleNextPress = useCallback(() => {
    if (!canExecutePayment) {
      return showAlert()
    }

    navigation.navigate('TokenRecipient', {
      aggregateWalletBannerBalance,
      // TODO: not must be amount in crypto
      amount: parseFloat(getCurrentValueStringAsCryptoOrZero()),
      predictedMaxTransactionFee,
    })
  }, [
    aggregateWalletBannerBalance,
    getCurrentValueStringAsCryptoOrZero,
    canExecutePayment,
    navigation,
    predictedMaxTransactionFee,
  ])

  const styles = useThemeAwareStyle(createStyles)

  return (
    <ScreenWrapper keyboardAvoiding>
      <View style={styles.container}>
        <TokenCalculator {...tokenCalculatorProps} autoFocus />
      </View>
      <BottomActionBar
        actions={[
          {
            label: 'Next',
            onPress: handleNextPress,
            disabled: !canExecutePayment,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.m,
      flex: 1,
    },
  })
