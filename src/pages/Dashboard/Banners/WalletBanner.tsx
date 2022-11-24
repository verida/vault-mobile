import { Container } from 'native-base'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import ChevronRightPrimaryIcon from 'assets/icons/chevron_right_primary.svg'
import MainWallet from 'assets/icons/main_wallet.svg'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'
import { getBalances } from 'reduxStore/wallet/actions'
import { getTokensData, getWalletsData } from 'reduxStore/wallet/selectors'

import {
  PRIMARY_COLOR_100,
  PRIMARY_COLOR_200,
  PRIMARY_COLOR_300,
  PRIMARY_COLOR_500,
} from '../../../constants/color'

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
      <View style={styles.wallet}>
        <View style={styles.walletContent}>
          <View style={styles.walletIcon}>
            <MainWallet />
          </View>
        </View>
        <View>
          <Text style={styles.walletText}>All Wallet</Text>
          <Text style={styles.walletAmount}>$ {total.toFixed(2)}</Text>
        </View>
      </View>
      <View>
        <ChevronRightPrimaryIcon />
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
    backgroundColor: PRIMARY_COLOR_200,
    borderRadius: 4,
    height: 72,
    width: '100%',
    paddingVertical: 16,
    paddingRight: 30,
    paddingLeft: 16,
  },
  walletIcon: {
    backgroundColor: PRIMARY_COLOR_100,
    borderRadius: 12,
    padding: 10,
  },
  walletContent: {
    marginRight: 12,
  },
  walletText: {
    fontFamily: NUNITO_SANS,
    fontSize: 12,
    color: PRIMARY_COLOR_300,
  },
  walletAmount: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
    color: PRIMARY_COLOR_500,
  },
  wallet: {
    flexDirection: 'row',
  },
})
