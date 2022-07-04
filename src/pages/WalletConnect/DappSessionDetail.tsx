import { useNavigation } from '@react-navigation/native'
import * as sentry from '@sentry/react-native'
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
import text from '../../styles/text'

const DappSessionDetail = () => {
  const params = useParams<{ dapp: DApp }>()
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const {
    session: { peerMeta, key, connected, peerId, accounts },
    chain,
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
        <View style={styles.appContainer}>
          <Image
            style={iconStyle.normal}
            source={{
              uri: icons?.[0],
            }}
          />
          <View style={styles.appTextContainer}>
            <Text style={text.primary}>{name}</Text>
            <Text style={text.darkgrey}>{url}</Text>
          </View>
        </View>
        <Spacer height={48} />
        <View style={styles.row}>
          <Text style={styles.label}>Connected</Text>
          <Text style={styles.value}>{connected ? 'Yes' : 'No'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{accounts?.[0]}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Network</Text>
          <Text style={styles.value}>
            {chain === 'ethr' ? 'Ethereum Rinkeby' : 'Algorand testnet'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>PeerId</Text>
          <Text style={styles.value}>{peerId}</Text>
        </View>
        <Spacer height={48} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    minWidth: '40%',
    ...text.grey,
    fontSize: 16,
    textAlign: 'left',
  },
  value: {
    flex: 1,
    ...text.primary,
    textAlign: 'right',
    fontSize: 16,
  },
  appContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  appTextContainer: { flex: 1, alignItems: 'flex-start', marginLeft: 16 },
})
