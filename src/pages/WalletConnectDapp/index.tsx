import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useWalletConnectContext } from 'features/walletConnect'
import * as React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { iconStyle, LayoutStyle, text } from 'styles'

import Layout from 'components/Layouts/Layout'
import NavigationHeader, {
  HeaderProps,
} from 'components/Navigation/NavigationHeader'
import { Spacer } from 'components/Spacer'
import Text from 'components/Text'
import { BLACK_COLOR_OPACITY } from 'constants/color'
import { MainStackParams } from 'navigation/types'

const leftIcon: HeaderProps['left'] = { icon: 'back' }

export const WalletConnectDapp = React.memo(
  function WalletConnectDapp(): JSX.Element {
    const navigation =
      useNavigation<NativeStackNavigationProp<MainStackParams>>()
    const { activeSessions: defaultActiveSessions } = useWalletConnectContext()

    const activeSessions = Object.entries(defaultActiveSessions)

    return (
      <View style={styles.flex}>
        <NavigationHeader left={leftIcon} title='WalletConnect' />
        <Layout style={[LayoutStyle.layout]}>
          {activeSessions.length ? (
            <>
              <Text style={styles.title}>dApps</Text>
              <Spacer height={32} />
              {/* TODO: Loop children should be a component */}
              {activeSessions.map(([walletConnectSessionKey, dapp]) => (
                <TouchableOpacity
                  key={walletConnectSessionKey}
                  // TODO: Fix unhelpful naming conventions!
                  onPress={() =>
                    navigation.navigate<'WalletConnectDapps'>(
                      'WalletConnectDapps',
                      {
                        walletConnectSessionKey,
                      }
                    )
                  }>
                  <View style={styles.appContainer}>
                    <Image
                      style={iconStyle.normal}
                      source={{
                        // TODO: What is the default image to use? (i.e. || WalletConnectLogoUri)?
                        uri: dapp?.peer?.metadata?.icons?.[0],
                      }}
                    />
                    <View style={styles.appTextContainer}>
                      <Text style={[text.primary, styles.textAlignLeft]}>
                        {dapp?.peer?.metadata?.name}
                      </Text>
                      <Text style={[text.grey, styles.textAlignLeft]}>
                        {dapp?.peer?.metadata?.url}
                      </Text>
                      <Text
                        //eslint-disable-next-line react/no-children-prop
                        children={`PeerId: ${dapp?.peer?.publicKey}`}
                        style={[text.grey, styles.textAlignLeft]}
                      />
                    </View>
                    <Icon
                      size={22}
                      // TODO: create a hook for margins
                      style={{ marginLeft: 16 }}
                      name='keyboard-arrow-right'
                      color={BLACK_COLOR_OPACITY(0.45)}
                    />
                  </View>
                </TouchableOpacity>
              ))}
              <Spacer height={32} />
            </>
          ) : (
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
)

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // TODO: Should this be a dedicated style?
  title: {
    ...text.primary,
    fontSize: 18,
    textAlign: 'left',
  },
  // TODO: Should this be a dedicated style?
  label: {
    ...text.grey,
    fontSize: 16,
    textAlign: 'left',
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
  textAlignLeft: { textAlign: 'left' },
})
