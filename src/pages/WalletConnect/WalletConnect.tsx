import { Container } from 'native-base'
import React from 'react'
import { Button, Image, View } from 'react-native'
import { connect } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'

import Text from '../../components/Text'
import { useReduxState } from '../../hooks/useReduxState'
import { dappsSelector } from '../../reduxStore/selectors'
import LayoutStyle from '../../styles/layouts'

export function isWalletConnectSession(object: any) {
  return typeof object.bridge !== 'undefined'
}

const WalletConnectScreen = (props: any) => {
  const dapps = useReduxState(dappsSelector)

  return (
    <Container>
      <NavigationHeader left={{ icon: 'back' }} title='Wallet Connect' />

      <View style={[LayoutStyle.layout, { flexDirection: 'column' }]}>
        <View>
          <Text>Apps</Text>
          {dapps.length ? (
            dapps.map((dapp) => (
              <View
                style={{
                  flexDirection: 'row',
                  padding: 20,
                  alignItems: 'center',
                }}
                key={dapp.session.key}>
                <Image
                  style={{ width: 60, height: 60 }}
                  source={{
                    uri: dapp.session?.peerMeta?.icons?.[0],
                  }}
                />
                <View style={{ padding: 8, alignItems: 'flex-start' }}>
                  <Button
                    title={
                      dapp.session?.peerMeta?.name ??
                      dapp.session?.peerMeta?.url ??
                      dapp.session?.peerId
                    }
                    onPress={() => {}}
                  />
                  <Text>
                    {'PeerId: ' +
                      dapp.session.peerId +
                      '\nKey:' +
                      dapp.session.key.substring(0, 10)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text>{'No pending requests'}</Text>
          )}
        </View>
      </View>
    </Container>
  )
}

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  return {
    publicProfileData: state.publicProfileData,
    selectedAccount: state.selectedAccount,
  }
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletConnectScreen)
