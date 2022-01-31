import React, { useState } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native'
import { Container, Icon } from 'native-base'
import Clipboard from '@react-native-community/clipboard'
import { connect } from 'react-redux'

import Text from 'components/Text'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Button from 'components/Button'
import InputStyles from 'styles/inputs'
import Label from 'components/Label'
import { isValidWalletAddress } from 'wallet/helpers/validation'

import { NUNITO_SANS_SEMIBOLD, NUNITO_SANS_BOLD } from 'constants/text'

import { getTransactionParams } from 'reduxStore/wallet/actions'

const TokenRecipient = ({ navigation, route, onGetTransactionParams }) => {
  const { token, amount } = route.params
  const [address, setAddress] = useState('')
  const [processing, setProcessing] = useState(false)
  const fetchCopiedText = async () => {
    const clipboardData = await Clipboard.getString()
    setAddress(clipboardData)
    // setAddress('WMZPP2ZIPOY3QMM77RETFMBJKM5TNUCR55QPWTEU4EUW4OVDGZDWDVN4T4')
  }
  function onReadQRCode(data) {
    setAddress(data)
  }
  function onScanQRPress() {
    navigation.navigate('ScanQrCode', {
      firstTime: false,
      onReadQRCode: (data) => onReadQRCode(data),
    })
  }
  const showAlert = () =>
    Alert.alert('Invalid address', `That's not a valid address`)

  const onPressSend = () => {
    if (isValidWalletAddress(address)) {
      setProcessing(true)
      onGetTransactionParams({
        token,
        amount,
        address,
      })
    } else {
      showAlert()
    }
  }

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={'Send ' + token.symbol}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <Label>Recipient address</Label>
          <TextInput
            value={address}
            autoFocus={true}
            // multiline
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
            disabled={!address}
            loading={processing}
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

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onGetTransactionParams: (params) => dispatch(getTransactionParams(params)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TokenRecipient)
