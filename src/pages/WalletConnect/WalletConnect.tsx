import sentry from '@sentry/react-native'
import WalletConnect from '@walletconnect/client'
import { Container } from 'native-base'
import React, { useMemo, useState } from 'react'
import { Button, Image, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { connect, useDispatch } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import * as actions from 'reduxStore/actions'
import InputStyles from 'styles/inputs'

import AccountManager from '../../api/AccountManager'
import DropDownPicker from '../../components/Select'
import { Spacer } from '../../components/Spacer'
import Text from '../../components/Text'
import { useReduxState } from '../../hooks/useReduxState'
import { removeWalletConnectDapp } from '../../reduxStore/actions'
import {
  dappsSelector,
  walletConnectNetworkSelector,
} from '../../reduxStore/selectors'
import LayoutStyle from '../../styles/layouts'
import { SUPPORTED_CHAINS } from '../../wallet-connect/constants/chains'
import { IChainData } from '../../wallet-connect/types'

export function isWalletConnectSession(object: any) {
  return typeof object.bridge !== 'undefined'
}

const WalletConnectScreen = () => {
  const dapps = useReduxState(dappsSelector)
  const [address] = useState(
    AccountManager.getInstance()
      .getSelectedAccount()
      ?.did.replace('did:vda:', '') as string
  )
  const { chain_id: chainId } = useReduxState(walletConnectNetworkSelector)

  const dispatch = useDispatch()

  const options = useMemo(
    () =>
      SUPPORTED_CHAINS.map((item) => ({
        ...item,
        label: item.name,
        value: item.chain_id,
      })),
    []
  )

  return (
    <Container>
      <NavigationHeader left={{ icon: 'back' }} title='Wallet Connect' />

      <View style={[LayoutStyle.layout, { flexDirection: 'column' }]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 300 }}
          showsVerticalScrollIndicator={false}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>DApps</Text>
            <Spacer height={16} />
            <Text>Wallet:</Text>
            <Spacer height={4} />
            <Text>{address}</Text>
            <Spacer height={4} />
            <Text>Network:</Text>
            <Spacer height={4} />
            <DropDownPicker
              showArrow
              placeholder='Select network'
              items={options}
              containerStyle={InputStyles.select}
              defaultValue={chainId}
              onChangeItem={(item: IChainData) => {
                dispatch(actions.setWalletConnectNetwork({ network: item }))
              }}
            />

            <Spacer height={32} />
            {dapps.length > 0 &&
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
                    <Text style={{ fontSize: 18 }}>
                      {dapp.session?.peerMeta?.name ??
                        dapp.session?.peerMeta?.url ??
                        dapp.session?.peerId}
                    </Text>
                    <Text>
                      {'PeerId: ' +
                        dapp.session.peerId +
                        '\nKey:' +
                        dapp.session.key.substring(0, 10)}
                    </Text>

                    <Button
                      title='Disconnect'
                      onPress={async () => {
                        try {
                          dispatch(
                            removeWalletConnectDapp({ key: dapp.session.key })
                          )
                          const wcConnector = new WalletConnect({
                            session: dapp.session,
                          })
                          wcConnector.killSession()
                        } catch (error) {
                          sentry.captureException(error)
                        }
                      }}
                    />
                  </View>
                </View>
              ))}
          </View>
        </ScrollView>
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
