import React, { useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MainStackParams } from 'navigation/types'
import TestnetSvg from 'assets/icons/testnet.svg'
import MainnetSvg from 'assets/icons/mainnet.svg'
import { Container, Content } from 'native-base'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import NetworkItem from './NetworkItem'
import { StyleSheet } from 'react-native'

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
