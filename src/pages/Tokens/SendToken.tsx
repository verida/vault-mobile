import { RouteProp } from '@react-navigation/native'
import {
  AggregateWalletBannerBalance,
  useChainIdForResourceParams,
} from 'features/cryptoWallet'
import {
  usePredictMaxTransactionFeeOrZero,
  useTokenCalculator,
} from 'features/token'
import { Container } from 'native-base'
import React from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import Button from 'components/Button'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenCalculator from 'components/Tokens/TokenCalculator'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'

import LeftArrowIcon from '../../assets/left_arrow_icon.svg'

const showAlert = () =>
  Alert.alert('Invalid quantity', 'Quantity is higher than wallet balance')

export type SendTokenRouteProp = RouteProp<MainStackParams, 'SendToken'>

export type SendTokenScreenProps = {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

const SendToken = React.memo(function SendToken() {
  const navigation = useMainNavigation()
  const { aggregateWalletBannerBalance } = useParams<SendTokenScreenProps>()

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

  const onPress = React.useCallback(() => {
    if (!canExecutePayment) return showAlert()

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

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <LeftArrowIcon />,
          action: () => navigation.goBack(),
        }}
        title={`Send ${aggregateWalletBannerBalance.symbol}`}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <TokenCalculator {...tokenCalculatorProps} autoFocus />
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.nextButton}
            color='primary'
            disabled={!canExecutePayment}
            onPress={onPress}>
            Next
          </Button>
        </View>
      </ScrollView>
    </Container>
  )
})

export default SendToken

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.1)',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
  nextButton: {
    alignSelf: 'stretch',
  },
  label: {
    color: 'rgba(4, 17, 51, 0.7)',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    marginBottom: 8,
  },
  addressScroller: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: -15,
  },
  singleAddress: {
    borderWidth: 1,
    borderColor: 'rgba(224, 227, 234, 1)',
    borderRadius: 4,
    width: 180,
    marginLeft: 15,
  },
  itemSelected: {
    backgroundColor: 'rgba(245, 244, 255, 1)',
    borderColor: 'rgba(66, 59, 206, 1)',
  },
  itemLast: {
    marginRight: 15,
  },
  addressAmount: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  walletNameWrapper: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(224, 227, 234, 1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: 'rgba(4, 17, 51, 1)',
    lineHeight: 21,
  },
  amountText: { color: 'rgba(4, 17, 51, 0.5)', fontSize: 14 },
  walletName: {
    marginLeft: 9,
    color: 'rgba(4, 17, 51, 0.5)',
    fontSize: 14,
  },
  tokenScroller: {
    flexDirection: 'row',
    marginHorizontal: -15,
  },
  singleToken: {
    flexDirection: 'row',
    width: 180,
    borderWidth: 1,
    borderColor: 'rgba(224, 227, 234, 1)',
    padding: 8,
    marginLeft: 15,
    alignItems: 'center',
    borderRadius: 4,
  },
  nameQuantity: {
    marginLeft: 12,
  },
  tokenQuantity: {
    color: 'rgba(4, 17, 51, 0.5)',
    fontSize: 14,
  },
  tokenName: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: 'rgba(4, 17, 51, 1)',
    lineHeight: 21,
  },
})
