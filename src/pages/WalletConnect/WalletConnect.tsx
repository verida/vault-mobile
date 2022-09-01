import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Container } from 'native-base'
import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { connect } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'

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
    <Container>
      <NavigationHeader left={{ icon: 'back' }} title='WalletConnect' />

      <View style={[LayoutStyle.layout]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          <View>
            {dapps.length > 0 && (
              <>
                <Text style={styles.title}>
                  {dappsv2.length > 0 ? 'WC dApps v1' : 'DApps'}
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
                <Text style={styles.title}>WC dApps v2</Text>
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
          </View>
        </ScrollView>
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
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
