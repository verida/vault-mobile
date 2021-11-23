import React from 'react'
import { Container, List, Icon } from 'native-base'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenBanner from 'components/Tokens/TokenBanner'
import TransactionsList from 'components/Tokens/TransactionsList'

const bannerData = {
  coin: 'ethereum',
  symbol: 'ETH',
  price: 1414.12,
  change: 16.44,
  quantity: 1.0993,
  amount: 1509.09,
}

const list = [
  {
    type: 'sent',
    symbol: 'ETH',
    address: '0x9991d3c...cF2930BCf8c',
    quantity: 2.04,
  },
  {
    type: 'received',
    symbol: 'ETH',
    address: '0x9991d3c...cF2930BCf8c',
    quantity: 24.04,
  },
  {
    type: 'sent',
    symbol: 'ETH',
    address: '0x9991d3c...cF2930BCf8c',
    quantity: 2.04,
  },
  {
    type: 'received',
    symbol: 'ETH',
    address: '0x9991d3c...cF2930BCf8c',
    quantity: 0.12,
  },
]

export default ({ navigation }) => {
  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title='Ethereum'
      />
      <TokenBanner data={bannerData} />
      <List>
        <TransactionsList list={list} />
      </List>
    </Container>
  )
}
