import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import SettingsIcon from 'assets/settings_icon.svg'
import MultichainWalletIcon from 'assets/wallet_icon_32.svg'
import AppModal from 'components/modal/AppModal'
import WalletListItem from 'components/WalletList/WalletListItem'
import { NUNITO_SANS } from 'constants/text'
import { MainStackParams } from 'navigation/types'

import { PRIMARY_COLOR, WHITE_COLOR } from '../../constants/color'
import { getAllWallets, getSelectedWalletId } from 'reduxStore/wallet/selectors'
import { selectChains } from 'reduxStore/tokens/selectors'
import { connect } from 'react-redux';
import { WalletItemProps, WalletType } from 'components/WalletList/types'
interface WalletSelectorModalProps {
  onCloseModal: () => void
  modalVisible: boolean
  selectedWalletId?: any
  wallets?: WalletType
  chains?: any
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

const WalletSelectorModal = ({
  modalVisible,
  chains,
  wallets,
  selectedWalletId,
  onCloseModal,
}: WalletSelectorModalProps) => {
  const [walletList, setWalletList] = useState<WalletItemProps[]>([])
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()


  const getWallets = (wallets: WalletType, chains: any): WalletItemProps[] => {
    return Object.values(wallets || {}).map((singleWallet: any) => {
      const { label, id, type } = singleWallet
      return {
        label,
        id,
        icon: <MultichainWalletIcon />,
        count: type === 'multi' ? Object.keys(chains).length : 1
      }
    })
  }


  useEffect(() => {
    if (wallets) {
      const list = getWallets(wallets, chains)
      setWalletList(list)
    }

  }, [])

  const onPressHandler = () => {
    navigation.navigate('ManageWallets')
  }

  const ModalFooter = (
    <Pressable
      style={styles.footerButton}
      onPress={onPressHandler}
      hitSlop={HIT_SLOP}>
      <View
        style={{
          marginRight: 10,
        }}>
        <SettingsIcon />
      </View>
      <Text
        style={{
          color: WHITE_COLOR,
          fontFamily: NUNITO_SANS,
          fontWeight: '700',
          fontSize: 17,
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
          <WalletListItem
            key={item.id}
            item={item}
            leftIconType='checked'
            selectedWalletId={selectedWalletId}
          />
        ))}
      </View>
    </AppModal>
  )
}

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  return {
    wallets: getAllWallets(state),
    chains: selectChains(rootState),
    selectedWalletId: getSelectedWalletId(state),
  }
}

export default connect(mapStateToProps)(WalletSelectorModal)

const styles = StyleSheet.create({
  walletList: {
    marginTop: 24.5,
  },
  footerButton: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_COLOR,
    width: '100%',
    color: WHITE_COLOR,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 35,
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
