import { useActionSheet } from '@expo/react-native-action-sheet'
import { Container, Content, List, Icon } from 'native-base'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { createNewWallet } from 'reduxStore/wallet/actions'

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

const ManageWallets = ({ createNewWallet }) => {
  const [loading] = useState(false)
  const { showActionSheetWithOptions } = useActionSheet()

  return (
    <Container>
      <NavigationHeader
        title='Wallets'
        right={{
          icon: <Icon name='add' style={{ color: '#000' }} />,
          action: () =>
            showActionSheetWithOptions(
              {
                options: ['Create new wallet', 'Cancel'],
                cancelButtonIndex: 1,
              },
              (buttonIndex) => {
                if (buttonIndex === 0) {
                  createNewWallet()
                }
              }
            ),
        }}
      />
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

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    createNewWallet: () => dispatch(createNewWallet()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageWallets)
