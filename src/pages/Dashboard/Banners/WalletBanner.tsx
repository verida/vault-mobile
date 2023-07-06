import { useNavigation } from '@react-navigation/native'
import { getWalletsData } from 'features/wallets'
import React, { useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import ChevronRightPrimaryIcon from 'assets/icons/chevron_right_primary.svg'
import MainWallet from 'assets/icons/main_wallet.svg'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'

import {
  PRIMARY_COLOR_100,
  PRIMARY_COLOR_200,
  PRIMARY_COLOR_300,
  PRIMARY_COLOR_500,
} from '../../../constants/color'

interface WalletSummaryProps {
  onGetBalances: () => void
  data: {
    listAndTotal: {
      total: number
    }
  }
  wallets: unknown
}

const WalletSummary = (props: WalletSummaryProps) => {
  const { onGetBalances, data, wallets } = props

  const { listAndTotal } = data
  const { total } = listAndTotal

  const navigation = useNavigation()

  const handlePress = () => {
    navigation.navigate('Assets' as never)
  }

  useEffect(() => {
    async function loadData() {
      onGetBalances()
    }

    loadData()
  }, [onGetBalances, wallets])

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.walletDetails}>
        <View style={styles.walletIcon}>
          <MainWallet />
        </View>
        <View>
          <Text style={styles.walletLabel}>All wallets</Text>
          <Text style={styles.walletAmount}>$ {total.toFixed(2)}</Text>
        </View>
      </View>
      <View>
        <ChevronRightPrimaryIcon />
      </View>
    </Pressable>
  )
}

const mapStateToProps = (state: any) => {
  return {
    wallets: getWalletsData(state),
    // data: getTokensData(rootState),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    // onGetBalances: () => dispatch(getBalances()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletSummary)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PRIMARY_COLOR_200,
    borderRadius: 4,
    padding: 16,
  },
  walletIcon: {
    backgroundColor: PRIMARY_COLOR_100,
    borderRadius: 12,
    marginRight: 12,
    padding: 8,
  },
  walletLabel: {
    fontFamily: NUNITO_SANS,
    color: PRIMARY_COLOR_300,
    fontSize: 12,
    lineHeight: 18,
  },
  walletAmount: {
    fontFamily: NUNITO_SANS_BOLD,
    color: PRIMARY_COLOR_500,
    fontSize: 17,
    lineHeight: 22.1,
  },
  walletDetails: {
    flexDirection: 'row',
  },
})
