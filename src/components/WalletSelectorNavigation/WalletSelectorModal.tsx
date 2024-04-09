import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import SettingsIcon from '~/assets/settings_icon.svg'
import Button from '~/components/Button'
import AppModal from '~/components/modal/AppModal'
import WalletList from '~/components/WalletList'
import { PRIMARY_COLOR, WHITE_COLOR } from '~/constants/color'
import { NUNITO_SANS } from '~/constants/text'
import {
  LegacyCryptoWallet,
  selectCryptoWallet,
  useCryptoWallets,
  useSelectedWalletId,
} from '~/features/cryptoWallet'
import { MainStackParams } from '~/navigation/types'
import { useAppDispatch } from '~/reduxStore/types'

interface WalletSelectorModalProps {
  onCloseModal: () => void
  modalVisible: boolean
  chains?: any
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

const WalletSelectorModal = ({
  modalVisible,
  onCloseModal,
}: WalletSelectorModalProps) => {
  const wallets = useCryptoWallets()
  const selectedWalletId = useSelectedWalletId()

  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()

  const dispatch = useAppDispatch()

  const handleWalletSelection = (item: LegacyCryptoWallet) => {
    dispatch(selectCryptoWallet(item._id))
    onCloseModal()
  }

  const handleManageWalletsPress = () => {
    navigation.navigate('ManageWallets')
    onCloseModal()
  }

  const ModalFooter = (
    <Button
      icon={<SettingsIcon />}
      style={styles.footerButton}
      onPress={handleManageWalletsPress}
      hitSlop={HIT_SLOP}>
      Manage Wallets
    </Button>
  )

  return (
    <AppModal
      title='Your Wallets'
      onClose={onCloseModal}
      visible={modalVisible}
      footer={ModalFooter}>
      <View style={styles.walletList}>
        <WalletList
          list={wallets}
          leftIconType='checked'
          selectedWalletId={selectedWalletId}
          onPressItem={handleWalletSelection}
        />
      </View>
    </AppModal>
  )
}

export default WalletSelectorModal

const styles = StyleSheet.create({
  walletList: {
    marginTop: 24,
  },
  footerButton: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_COLOR,
    width: '100%',
    color: WHITE_COLOR,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: WHITE_COLOR,
    fontFamily: NUNITO_SANS,
    fontWeight: '700',
    fontSize: 17,
  },
})
