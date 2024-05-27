import Clipboard from '@react-native-community/clipboard'
import { BigNumber } from 'ethers'
import { Icon } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { BottomActionBar, ScreenWrapper } from '~/components'
import Label from '~/components/Label'
import Text from '~/components/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '~/constants/text'
import {
  AggregateWalletBannerBalance,
  isValidWalletAddressForChainId,
  useChainIdForResourceParams,
} from '~/features/cryptoWallet'
import { Logger } from '~/features/telemetry'
import { MainStackScreenProps } from '~/navigation/types'
import InputStyles from '~/styles/inputs'

const logger = Logger.create('TokenRecipient')

export type TokenRecipientScreenParams = {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly amount: number
  readonly predictedMaxTransactionFee: BigNumber
}

type TokenRecipientScreenProps = MainStackScreenProps<'TokenRecipient'>

export const TokenRecipientScreen: React.FC<TokenRecipientScreenProps> = (
  props
) => {
  const {
    navigation,
    route: { params },
  } = props
  const { aggregateWalletBannerBalance, amount, predictedMaxTransactionFee } =
    params

  useEffect(() => {
    navigation.setOptions({
      title: `Send ${aggregateWalletBannerBalance.symbol}`,
    })
  }, [navigation, aggregateWalletBannerBalance])

  const [address, setAddress] = useState<string>('')

  const { resource } = aggregateWalletBannerBalance

  const chainId = useChainIdForResourceParams({ resource })

  const isAddressValid = isValidWalletAddressForChainId(address, chainId)

  const fetchCopiedText = useCallback(async () => {
    const clipboardData = await Clipboard.getString()
    setAddress(clipboardData)
  }, [])

  const handleQRCodeRead = useCallback((data: string) => {
    setAddress(data)
  }, [])

  const handleScanQRButtonPress = useCallback(() => {
    navigation.navigate('ScanQrCode', {
      firstTime: false,
      onReadQRCode: handleQRCodeRead,
    })
  }, [navigation, handleQRCodeRead])

  const handleNextButtonPress = useCallback(() => {
    const showGenericFailure = (reason: string) => {
      Alert.alert('Unable to Send', reason)
    }

    if (!isAddressValid) {
      return
    }

    try {
      navigation.navigate('ConfirmTransaction', {
        amount,
        aggregateWalletBannerBalance,
        toAddress: address,
        predictedMaxTransactionFee,
      })
    } catch (e) {
      logger.error(e)
      showGenericFailure(String(e))
    }
  }, [
    aggregateWalletBannerBalance,
    isAddressValid,
    address,
    navigation,
    amount,
    predictedMaxTransactionFee,
  ])

  return (
    <ScreenWrapper keyboardAvoiding>
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
              onPress={handleScanQRButtonPress}
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
      </View>
      <BottomActionBar
        actions={[
          {
            label: 'Next',
            onPress: handleNextButtonPress,
            disabled: !isAddressValid,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
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
