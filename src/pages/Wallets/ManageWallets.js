import { Container, Content, Icon, List } from 'native-base'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import OtherSvg from '../../assets/wallets/Other.svg'
import WalletsList from '../../components/WalletsList'
import { SNOW_COLOR } from '../../constants/color'

const list = [
  {
    label: 'Multichain Wallet',
    icon: <OtherSvg />,
    count: 3,
  },
]

export default () => {
  const [loading] = useState(false)

  return (
    <Container>
      <NavigationHeader title='Wallets' />
      {loading ? (
        <LoadingView />
      ) : (
        <Content style={{ backgroundColor: SNOW_COLOR, paddingVertical: 25 }}>
          <List>
            <WalletsList list={list} />
          </List>
        </Content>
      )}
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.2)',
  },
  content: {
    flex: 1,
  },
})
