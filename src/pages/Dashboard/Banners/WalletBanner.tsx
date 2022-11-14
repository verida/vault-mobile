import { Container } from 'native-base'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { connect } from 'react-redux'

import MainWallet from 'assets/icons/main_wallet.svg'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'
import { getBalances } from 'reduxStore/wallet/actions'
import { getTokensData, getWalletsData } from 'reduxStore/wallet/selectors'

interface WalletSectionProps {
  onGetBalances: () => void
  data: {
    listAndTotal: {
      total: number
    }
  }
  wallets: unknown
}

const WalletSection = ({
  onGetBalances,
  data,
  wallets,
}: WalletSectionProps) => {
  useEffect(() => {
    async function loadData() {
      onGetBalances()
    }

    loadData()
  }, [onGetBalances, wallets])

  const { listAndTotal } = data

  const { total } = listAndTotal

  return (
    <Container style={styles.container}>
      <View style={styles.walletInfo}>
        <View style={styles.mainWalletIconWrapper}>
          <MainWallet />
        </View>
        <View>
          <Text style={styles.mainWalletText}>Main Wallet</Text>
          <Text style={styles.mainWalletAmount}>$ {total.toFixed(2)}</Text>
        </View>
      </View>
      <View>
        <AntDesign name={'right'} size={15} color={'#423BCE'} />
      </View>
    </Container>
  )
}

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  return {
    wallets: getWalletsData(state),
    data: getTokensData(rootState),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onGetBalances: () => dispatch(getBalances()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletSection)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E7E5FF',
    borderRadius: 4,
    marginVertical: 16,
    marginHorizontal: 16,
    height: 72,
    width: 355,
    padding: 16,
  },
  mainWalletIconWrapper: {
    marginRight: 12,
  },
  mainWalletText: {
    fontFamily: NUNITO_SANS,
    fontSize: 12,
    color: '#7986F7',
  },
  mainWalletAmount: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
    color: '#423BCE',
  },
  walletInfo: {
    flexDirection: 'row',
  },
})
