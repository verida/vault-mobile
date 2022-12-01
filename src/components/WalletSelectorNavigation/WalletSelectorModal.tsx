import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { SELECTED_WALLET_STORAGE_KEY } from 'api/AccountManager'
import SettingsIcon from 'assets/settings_icon.svg'
import MultichainWalletIcon from 'assets/wallet_icon_32.svg'
import AppModal from 'components/modal/AppModal'
import WalletList from 'components/WalletList'
import { WalletItem, WalletType } from 'components/WalletList/types'
import { NUNITO_SANS } from 'constants/text'
import { MainStackParams } from 'navigation/types'
import { selectChains } from 'reduxStore/tokens/selectors'
import { setSelectedWallet } from 'reduxStore/wallet/actions'
import { getAllWallets, getSelectedWalletId } from 'reduxStore/wallet/selectors'

import { PRIMARY_COLOR, WHITE_COLOR } from '../../constants/color'

interface WalletSelectorModalProps {
  onCloseModal: () => void
  modalVisible: boolean
  selectedWalletId?: any
  wallets?: WalletType
  chains?: any
  onSetSelectedWallet: (selectedWalletID: string) => Promise<void>
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

const WalletSelectorModal = ({
  modalVisible,
  chains,
  wallets,
  selectedWalletId,
  onCloseModal,
  onSetSelectedWallet,
}: WalletSelectorModalProps) => {
  const [walletList, setWalletList] = useState<WalletItem[]>([])
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()

  useEffect(() => {
    if (wallets) {
      const list = getWallets(wallets, chains)
      setWalletList(list)
    }
  }, [chains, wallets])

  const getWallets = (allWallets: WalletType, allChains: any): WalletItem[] => {
    return Object.values(allWallets || {}).map((singleWallet: any) => {
      const { label, id, type } = singleWallet
      return {
        label,
        id,
        icon: <MultichainWalletIcon />,
        count: type === 'multi' ? Object.keys(allChains).length : 1,
      }
    })
  }

  const handleWalletSelection = (item: WalletItem) => {
    const selectedWalletID = item.id
    onSetSelectedWallet(selectedWalletID)
    SecureStore.setItemAsync(SELECTED_WALLET_STORAGE_KEY, selectedWalletID)
  }

  const onPressHandler = () => {
    navigation.navigate('ManageWallets')
    onCloseModal()
  }

  const ModalFooter = (
    <Pressable
      style={styles.footerButton}
      onPress={onPressHandler}
      hitSlop={HIT_SLOP}>
      <View style={styles.buttonIcon}>
        <SettingsIcon />
      </View>
      <Text style={styles.buttonText}>Manage Wallets</Text>
    </Pressable>
  )

  return (
    <AppModal
      title='Your Wallets'
      onClose={onCloseModal}
      visible={modalVisible}
      footer={ModalFooter}>
      <View style={styles.walletList}>
        <WalletList
          list={walletList}
          leftIconType='checked'
          selectedWalletId={selectedWalletId}
          onPressItem={handleWalletSelection}
        />
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

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onSetSelectedWallet: (walletID: string) =>
      dispatch(setSelectedWallet(walletID) as any),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletSelectorModal)

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
    paddingVertical: 10,
    paddingHorizontal: 35,
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 50,
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
