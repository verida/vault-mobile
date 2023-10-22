import Clipboard from '@react-native-community/clipboard'
import { RouteProp } from '@react-navigation/native'
import {
  BalanceByChainResult,
  //getTransactionParams,
  //GetTransactionParamsParams,
  isBalanceByChainResult,
  isValidWalletAddress,
} from 'features/cryptoWallet'
import { getTokenUnitName } from 'features/token'
import { Container, Icon } from 'native-base'
import React, { useState } from 'react'
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

//import { connect } from 'react-redux'
import Button from 'components/Button'
import Label from 'components/Label'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'
//import { AppDispatch } from 'reduxStore/types'
import InputStyles from 'styles/inputs'

export type TokenRecipientRouteProp = RouteProp<MainStackParams, 'SendToken'>

export type TokenRecipientScreenProps = {
  readonly token: BalanceByChainResult
  readonly amount: number
}

const TokenRecipient = () => {
  const navigation = useMainNavigation()
  const { token, amount: amount } = useParams<TokenRecipientScreenProps>()

  const [address, setAddress] = useState<string>('')

  const fetchCopiedText = async () => {
    const clipboardData = await Clipboard.getString()
    setAddress(clipboardData)
  }
  function onReadQRCode(data: string) {
    setAddress(data)
  }
  function onScanQRPress() {
    navigation.navigate('ScanQrCode', {
      firstTime: false,
      onReadQRCode: (data) => onReadQRCode(data),
    })
  }

  const onPressSend = React.useCallback(async () => {
    const showGenericFailure = (reason: string) =>
      Alert.alert('Unable to Send', reason)

    if (!isBalanceByChainResult(token))
      return showGenericFailure('An internal error occurred.')

    try {
      navigation.navigate('ConfirmTransaction', {
        amount,
        token,
        toAddress: address,
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      showGenericFailure(String(e))
    }
  }, [token, address, navigation, amount])

  const disabled = !isValidWalletAddress(address, token.asset)

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={`Send ${getTokenUnitName(token)}`}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <Label>Recipient address</Label>
          <TextInput
            value={address}
            autoFocus={true}
            editable
            autoCorrect={false}
            autoCapitalize='none'
            onChangeText={setAddress}
            style={[InputStyles.input]}
            placeholder={'eg. 1DkyBEKt5S2GDtv7aQw6r...'}
          />
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={onScanQRPress}
              style={styles.actionButton}>
              <Icon name='qr-code' style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={fetchCopiedText}
              style={styles.actionButton}>
              <Icon name='clipboard' style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Paste</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.nextButton}
            color='primary'
            disabled={disabled}
            onPress={onPressSend}>
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
  addressScroller: { flexDirection: 'row', marginBottom: 16 },
  singleAddress: {
    borderWidth: 1,
    borderColor: 'rgba(224, 227, 234, 1)',
    borderRadius: 4,
    width: 180,
    marginRight: 8,
  },
  itemSelected: {
    backgroundColor: 'rgba(245, 244, 255, 1)',
    borderColor: 'rgba(66, 59, 206, 1)',
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
  },
  singleToken: {
    flexDirection: 'row',
    width: 180,
    borderWidth: 1,
    borderColor: 'rgba(224, 227, 234, 1)',
    padding: 8,
    marginRight: 8,
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
  actionButtons: {
    flexDirection: 'row',
    marginTop: 15,
  },
  actionButton: {
    marginRight: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonIcon: {
    color: 'rgba(66, 59, 206, 1)',
    fontSize: 24,
    marginRight: 10,
  },
  actionButtonText: {
    color: 'rgba(66, 59, 206, 1)',
    fontFamily: NUNITO_SANS_BOLD,
  },
})

//const mapStateToProps = () => ({})
//
//const mapDispatchToProps = (dispatch: AppDispatch) => {
//  return {
//    onGetTransactionParams: (params: GetTransactionParamsParams) =>
//      dispatch(getTransactionParams(params)),
//  }
//}

export default TokenRecipient
//connect(mapStateToProps, mapDispatchToProps)(TokenRecipient)
