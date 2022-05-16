import { useNavigation } from '@react-navigation/native'
import sentry from '@sentry/react-native'
import WalletConnect from '@walletconnect/client'
import { Icon } from 'native-base'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { DApp } from 'wallet-connect/types'

import Button from 'components/Button'

import NavigationHeader from '../../components/Navigation/NavigationHeader'
import { Spacer } from '../../components/Spacer'
import useParams from '../../hooks/useParams'
import { removeWalletConnectDapp } from '../../reduxStore/actions'
import iconStyle from '../../styles/icon'
import LayoutStyle from '../../styles/layouts'

const DappSessionDetail = () => {
  const params = useParams<{ dapp: DApp }>()
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const {
    session: { peerMeta, key },
  } = params.dapp

  const { name, icons, url } = peerMeta || {}

  return (
    <View>
      <NavigationHeader
        title='Wallet Connect'
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
      />
      <View style={LayoutStyle.layout}>
        <View style={styles.row}>
          <Image
            style={iconStyle.normal}
            source={{
              uri: icons?.[0],
            }}
          />
          <View style={{ padding: 16, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 18 }}>{name}</Text>
            <Text>{url}</Text>
          </View>
        </View>
        <Button
          style={styles.disconnectButton}
          color='transparent-warning'
          onPress={() => {
            try {
              dispatch(removeWalletConnectDapp({ key }))
              navigation.goBack()
              const wcConnector = new WalletConnect({
                session: params.dapp.session,
              })
              wcConnector.killSession()
            } catch (error) {
              sentry.captureException(error)
            }
          }}>
          Disconnect
        </Button>
      </View>
    </View>
  )
}

export default DappSessionDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    paddingBottom: 30,
  },
  disconnectButton: {
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
})
