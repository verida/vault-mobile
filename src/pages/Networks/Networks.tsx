import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Container, Content } from 'native-base'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'

import MainnetSvg from 'assets/icons/mainnet.svg'
import TestnetSvg from 'assets/icons/testnet.svg'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackParams } from 'navigation/types'

import NetworkItem from './NetworkItem'

const NETWORKS = [
  {
    id: 'testnet',
    title: 'Testnet',
    logo: <TestnetSvg />,
    disabled: false,
  },
  {
    id: 'mainnet',
    title: 'Mainnet',
    logo: <MainnetSvg />,
    disabled: true,
  },
]

function Networks(_props: NativeStackScreenProps<MainStackParams, 'Networks'>) {
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0].id)

  return (
    <Container>
      <NavigationHeader title={'Networks'} />
      <Content style={styles.content}>
        {NETWORKS.map((network) => (
          <NetworkItem
            network={network}
            onSelect={() => setSelectedNetwork(network.id)}
            selected={selectedNetwork === network.id}
            key={network.id}
          />
        ))}
      </Content>
    </Container>
  )
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 24,
  },
})

export default Networks
