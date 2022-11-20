import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'


import ChevronDownIcon from 'assets/chevron_down_icon.svg'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'
import { BLACK_COLOR } from 'constants/color'

import MultichainWalletIcon from 'assets/wallet_icon_32.svg'
import { getAllWallets, getSelectedWalletId, getWalletCount } from 'reduxStore/wallet/selectors'
import { selectChains } from 'reduxStore/tokens/selectors'
import { WalletItemProps, WalletType } from 'components/WalletSelectorList/WalletSelectorListItem'
import WalletSelectorModal from './WalletSelectorModal'
import { connect } from 'react-redux';

interface WalletSelectorHeaderProps {
  wallets: WalletType
  chains: any
  selectedWalletId: string
}

const HIT_SLOP = { top: 15, right: 15, bottom: 15, left: 15 }

const WalletSelectorHeader = (props: WalletSelectorHeaderProps) => {
  const { wallets, selectedWalletId, chains } = props
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<WalletItemProps | undefined>()
  const [walletList, setWalletList] = useState<WalletItemProps[]>([])


  useEffect(() => {
    const list = Object.values(wallets).map((singleWallet: any) => {
      const { label, id, type } = singleWallet
      return {
        label,
        id,
        icon: <MultichainWalletIcon />,
        count: type === 'multi' ? Object.keys(chains).length : 1,
      }
    })
    setWalletList(list)

    const getSelectedWallet = walletList.find((item) => item.id === selectedWalletId)

    if (getSelectedWallet) {
      setSelectedWallet(getSelectedWallet)
    }
  }, [selectedWalletId])


  const onCloseModal = () => {
    setModalVisible(!modalVisible)
  }

  const openWalletModal = () => {
    setModalVisible(!modalVisible)
  }

  return (
    <React.Fragment>
      <Pressable
        hitSlop={HIT_SLOP}
        style={styles.container}
        onPress={openWalletModal}>
        <View >
          <MultichainWalletIcon />
        </View>
        <View
          style={styles.navigationContent}>
          <View
            style={styles.textWrapper}>
            <Text style={styles.textTitle}>{selectedWallet?.label}</Text>
            <View
              style={{
                marginTop: 3
              }}
            >
              <ChevronDownIcon />
            </View>
          </View>
          <Text style={styles.subText}>{selectedWallet?.count} addresses</Text>
        </View>
      </Pressable>
      <WalletSelectorModal
        walletList={walletList}
        modalVisible={modalVisible}
        onCloseModal={onCloseModal}
        selectedWalletId={selectedWalletId} />
    </React.Fragment>
  )
}


const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  return {
    wallets: getAllWallets(state),
    walletCount: getWalletCount(state),
    chains: selectChains(rootState),
    selectedWalletId: getSelectedWalletId(state)

  }
}

export default connect(mapStateToProps)(WalletSelectorHeader)


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  textWrapper: { flexDirection: 'row', },
  navigationContent: { marginHorizontal: 10, },
  textTitle: {
    fontSize: 14,
    fontFamily: NUNITO_SANS_BOLD,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
    color: BLACK_COLOR,
  },
  subText: {
    fontSize: 12,
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    color: BLACK_COLOR,
  },
})