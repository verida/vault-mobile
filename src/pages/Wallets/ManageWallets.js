import { Container, Content, List } from 'native-base'
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
        <Content style={styles.content}>
          <List>
            <WalletsList list={list} />
          </List>
        </Content>
      )}
    </Container>
  )
}

const styles = StyleSheet.create({
  content: { backgroundColor: SNOW_COLOR, paddingVertical: 25 },
})
