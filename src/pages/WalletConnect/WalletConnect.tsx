import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { selectPublicProfile } from 'features/profiles'
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { connect } from 'react-redux'

import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { RootState } from 'reduxStore/types'

import { Spacer } from '../../components/Spacer'
import Text from '../../components/Text'
import { BLACK_COLOR_OPACITY } from '../../constants/color'
import { useReduxState } from '../../hooks/useReduxState'
import { MainStackParams } from '../../navigation/types'
import { dappsSelector, dappsSelectorv2 } from '../../reduxStore/selectors'
import iconStyle from '../../styles/icon'
import LayoutStyle from '../../styles/layouts'
import text from '../../styles/text'

type WalletConnectScreenNavigationProp = NativeStackNavigationProp<
  MainStackParams,
  'WalletConnect'
>

const WalletConnectScreen = () => {
  const navigation = useNavigation<WalletConnectScreenNavigationProp>()
  const dapps = useReduxState(dappsSelector)
  const dappsv2 = useReduxState(dappsSelectorv2)

  return (
    <View style={[styles.container]}>
      <NavigationHeader left={{ icon: 'back' }} title='WalletConnect' />
      <Layout style={[LayoutStyle.layout]}>
        {dapps.length > 0 && (
          <>
            <Text style={styles.title}>
              {dappsv2.length > 0 ? 'WC v1 dApps' : 'DApps'}
            </Text>
            <Spacer height={32} />
            {dapps.map((dapp) => (
              <TouchableOpacity
                key={dapp.session.key}
                onPress={() => {
                  navigation.navigate('WalletConnectDapp', { dapp })
                }}>
                <View style={styles.appContainer}>
                  <Image
                    style={iconStyle.normal}
                    source={{
                      uri: dapp.session?.peerMeta?.icons?.[0],
                    }}
                  />
                  <View style={styles.appTextContainer}>
                    <Text style={[text.primary, { textAlign: 'left' }]}>
                      {dapp.session?.peerMeta?.name}
                    </Text>
                    <Text style={[text.grey, { textAlign: 'left' }]}>
                      {dapp.session?.peerMeta?.url}
                    </Text>
                    <Text style={[text.grey, { textAlign: 'left' }]}>
                      {'PeerId: ' + dapp.session.peerId}
                    </Text>
                  </View>
                  <Icon
                    size={22}
                    style={{ marginLeft: 16 }}
                    name='keyboard-arrow-right'
                    color={BLACK_COLOR_OPACITY(0.45)}
                  />
                </View>
              </TouchableOpacity>
            ))}
            <Spacer height={32} />
          </>
        )}

        {dappsv2.length > 0 && (
          <>
            <Text style={styles.title}>WC v2 dApps</Text>
            <Spacer height={32} />
            {dappsv2.map((dapp) => (
              <TouchableOpacity
                key={dapp.id}
                onPress={() => {
                  navigation.navigate('WalletConnectDappv2', { dapp })
                }}>
                <View style={styles.appContainer}>
                  <Image
                    style={iconStyle.normal}
                    source={{
                      uri: dapp.metadata.icons[0],
                    }}
                  />
                  <View style={styles.appTextContainer}>
                    <Text style={[text.primary, { textAlign: 'left' }]}>
                      {dapp.metadata.name}
                    </Text>
                    <Text style={[text.grey, { textAlign: 'left' }]}>
                      {dapp.metadata.url}
                    </Text>
                    <Text style={[text.grey, { textAlign: 'left' }]}>
                      {'Id: ' + dapp.id}
                    </Text>
                    <Text style={[text.grey, { textAlign: 'left' }]}>
                      {'Relay Protocol: ' + dapp.relayProtocol}
                    </Text>
                  </View>
                  <Icon
                    size={22}
                    style={{ marginLeft: 16 }}
                    name='keyboard-arrow-right'
                    color={BLACK_COLOR_OPACITY(0.45)}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {dapps.length === 0 && dappsv2.length === 0 && (
          <>
            <Spacer height={32} />
            <Text
              style={[
                text.grey,
                styles.label,
                { flex: 1, alignSelf: 'center' },
              ]}>
              {'No dApps'}
            </Text>
          </>
        )}
      </Layout>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...text.primary,
    fontSize: 18,
    textAlign: 'left',
  },
  label: {
    ...text.grey,
    fontSize: 16,
    textAlign: 'left',
  },
  value: {
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
    marginBottom: 16,
  },
  appTextContainer: { flex: 1, alignItems: 'flex-start', marginLeft: 16 },
})

const mapStateToProps = (state: RootState) => {
  return {
    publicProfileData: selectPublicProfile(state),
    selectedAccount: state.main.selectedAccount,
  }
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletConnectScreen)
