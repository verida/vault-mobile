import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as SecureStore from 'helpers/VeridaSecureStore'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import SettingsIcon from 'assets/settings_icon.svg'
import Button from 'components/Button'
import AppModal from 'components/modal/AppModal'
import WalletList from 'components/WalletList'
import { WalletItem } from 'components/WalletList/types'
import CONFIG from 'config/environment'
import { PRIMARY_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS } from 'constants/text'
import { MainStackParams } from 'navigation/types'
import { selectChains } from 'reduxStore/tokens/selectors'
import { setSelectedWallet } from 'reduxStore/wallet/actions'
import { getSelectedWalletId, getWalletList } from 'reduxStore/wallet/selectors'

interface WalletSelectorModalProps {
  onCloseModal: () => void
  modalVisible: boolean
  selectedWalletId?: any
  wallets?: WalletItem[]
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
      setWalletList(wallets)
    }
  }, [chains, wallets])

  const handleWalletSelection = (item: WalletItem) => {
    onSetSelectedWallet(item.id)
    SecureStore.setItemAsync(CONFIG.SELECTED_WALLET_STORAGE_KEY, item.id)
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
  const chains = selectChains(rootState)
  return {
    chains,
    wallets: getWalletList(state, chains),
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
