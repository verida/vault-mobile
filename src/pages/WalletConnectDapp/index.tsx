import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {
  useWalletConnectContext,
  WalletConnectSessionItem,
} from 'features/walletConnect'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { LayoutStyle, text } from 'styles'

import Layout from 'components/Layouts/Layout'
import NavigationHeader, {
  HeaderProps,
} from 'components/Navigation/NavigationHeader'
import { Spacer } from 'components/Spacer'
import Text from 'components/Text'
import { MainStackParams } from 'navigation/types'

const leftIcon: HeaderProps['left'] = { icon: 'back' }

export const WalletConnectDapp = React.memo(
  function WalletConnectDapp(): JSX.Element {
    const navigation =
      useNavigation<NativeStackNavigationProp<MainStackParams>>()
    const { activeSessions: defaultActiveSessions } = useWalletConnectContext()

    const activeSessions = Object.keys(defaultActiveSessions)

    return (
      <View style={styles.flex}>
        <NavigationHeader left={leftIcon} title='WalletConnect' />
        <Layout style={[LayoutStyle.layout]}>
          {activeSessions.length ? (
            <>
              <Text style={styles.title}>dApps</Text>
              <Spacer height={32} />
              {activeSessions.map((walletConnectSessionKey) => (
                <WalletConnectSessionItem
                  key={walletConnectSessionKey}
                  walletConnectSessionKey={walletConnectSessionKey}
                  onPress={() =>
                    // TODO: Fix this poor route naming convention
                    navigation.navigate<'WalletConnectDapps'>(
                      'WalletConnectDapps',
                      { walletConnectSessionKey }
                    )
                  }
                />
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
})
