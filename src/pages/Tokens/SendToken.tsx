import { RouteProp } from '@react-navigation/native'
import { SelectSingleTokenData } from 'features/cryptoWallet'
import { getTokenUnitName } from 'features/token'
import { Container, Icon } from 'native-base'
import React from 'react'
import { Alert, StyleSheet, View } from 'react-native'

import Button from 'components/Button'
// import Text from 'components/Text'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenCalculator from 'components/Tokens/TokenCalculator'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'

const showAlert = () =>
  Alert.alert('Invalid quantity', 'Quantity is higher than wallet balance')

export type SendTokenRouteProp = RouteProp<MainStackParams, 'SendToken'>

export type SendTokenScreenProps = {
  readonly token: SelectSingleTokenData
}

export default () => {
  const navigation = useMainNavigation()
  const { token } = useParams<SendTokenScreenProps>()
  const [amount, onUpdateAmount] = React.useState<number | null>(null)
  const [amountValid, onUpdateValidation] = React.useState<boolean>(false)

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={'Send ' + getTokenUnitName(token)}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <TokenCalculator
            token={token}
            onUpdateAmount={onUpdateAmount}
            onUpdateValidation={onUpdateValidation}
          />
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.nextButton}
            color='primary'
            disabled={Boolean(amount)}
            onPress={() => {
              if (amountValid) {
                navigation.navigate('TokenRecipient', { token, amount })
              } else {
                showAlert()
              }
            }}>
            Next
          </Button>
        </View>
      </View>
    </Container>
  )
}

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
