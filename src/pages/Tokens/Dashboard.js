import React from 'react'
import { StyleSheet } from 'react-native'
import { Container, List } from 'native-base'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenBanner from 'components/Tokens/TokenBanner'
import TokensList from 'components/Tokens/TokensList'
import SendListModal from './SendListModal'

import SettingsSvg from 'assets/icons/settings.svg'

import EthereumSvg from 'assets/wallets/Ethereum.svg'
import AlgorandSvg from 'assets/wallets/Algorand.svg'
import IKIGAISvg from 'assets/wallets/IKIGAI.svg'
import NearSvg from 'assets/wallets/Near.svg'

const bannerData = {
  amount: 1509.09,
}

const list = [
  {
    label: 'Ethereum',
    symbol: 'ETH',
    icon: <EthereumSvg />,
    price: 1414.12,
    change: 16.31,
    quantity: 2.04,
    amount: 2828.39,
  },
  {
    label: 'NEAR Protocol',
    symbol: 'NEAR',
    icon: <NearSvg />,
    price: 91.12,
    change: -16.31,
    quantity: 24.04,
    amount: 2402.39,
  },
  {
    label: 'Algorand',
    symbol: 'ALGO',
    icon: <AlgorandSvg />,
    price: 1414.12,
    change: 16.31,
    quantity: 2.04,
    amount: 2828.39,
  },
  {
    label: 'Ikigai',
    symbol: 'IKI',
    icon: <IKIGAISvg />,
    price: 1414.12,
    change: 16.31,
    quantity: 0,
    amount: 0,
  },
]

export default ({ navigation }) => {
  return (
    <Container>
      <NavigationHeader
        left={{ icon: 'skip' }}
        title='Tokens'
        right={{
          icon: <SettingsSvg />,
        }}
      />
      <TokenBanner data={bannerData} />
      <List>
        <TokensList list={list} />
      </List>
      <SendListModal list={list} />
    </Container>
  )
}

const styles = StyleSheet.create({})
