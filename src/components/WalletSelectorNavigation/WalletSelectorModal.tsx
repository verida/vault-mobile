import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import AppModal from 'components/modal/AppModal'

import WalletSelectorListItem, { WalletItemProps } from 'components/WalletSelectorList/WalletSelectorListItem'
import { MainStackParams } from 'navigation/types'

import SettingsIcon from 'assets/settings_icon.svg'
import { PRIMARY_COLOR, WHITE_COLOR } from '../../constants/color';
import { NUNITO_SANS } from 'constants/text';



interface WalletSelectorModalProps {
  onCloseModal: () => void
  modalVisible: boolean
  walletList: WalletItemProps[]
  selectedWalletId: string
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

const WalletSelectorModal = ({ modalVisible, walletList, selectedWalletId, onCloseModal }: WalletSelectorModalProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>();

  const onPressHandler = () => {
    navigation.navigate('ManageWallets')
  }

  const ModalFooter = (
    <Pressable
      style={styles.footerButton}
      onPress={onPressHandler}
      hitSlop={HIT_SLOP}
    >
      <View
        style={{
          marginRight: 10,

        }}
      >
        <SettingsIcon />
      </View>
      <Text style={{
        color: WHITE_COLOR,
        fontFamily: NUNITO_SANS,
        fontWeight: '700',
        fontSize: 17

      }}>
        Manage Wallets
      </Text>
    </Pressable>
  )

  return (
    <AppModal
      title='Your Wallets'
      onClose={onCloseModal}
      visible={modalVisible}
      footer={ModalFooter}>
      <View style={styles.walletList}>
        {walletList.map((item) => (
          <WalletSelectorListItem
            key={item.id}
            item={item}
            leftIconType="checked"
            selectedWalletId={selectedWalletId}
          />
        ))}
      </View>
    </AppModal>
  )
}

export default WalletSelectorModal

const styles = StyleSheet.create({
  walletList: {
    marginTop: 24.5,
  },
  footerButton: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_COLOR,
    width: '95%',
    color: WHITE_COLOR,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 35,
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  }
})