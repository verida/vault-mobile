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
import { MainStackScreenProps } from 'navigation/types'

const leftIcon: HeaderProps['left'] = { icon: 'back' }

export const WalletConnectActiveSessions = React.memo(
  function WalletConnectActiveSessions({
    navigation,
  }: MainStackScreenProps<'WalletConnectActiveSessions'>): JSX.Element {
    const { activeSessions: defaultActiveSessions } = useWalletConnectContext()

    const activeSessions = Object.keys(defaultActiveSessions)

    return (
      <View style={styles.flex}>
        <NavigationHeader left={leftIcon} title='WalletConnect DApps' />
        <Layout style={[LayoutStyle.layout]}>
          {activeSessions.length ? (
            <>
              <Text style={styles.title}>Active DApp Sessions</Text>
              <Spacer height={32} />
              {activeSessions.map((walletConnectSessionKey) => (
                <WalletConnectSessionItem
                  key={walletConnectSessionKey}
                  walletConnectSessionKey={walletConnectSessionKey}
                  onPress={() =>
                    navigation.navigate<'WalletConnectActiveSessionDetails'>(
                      'WalletConnectActiveSessionDetails',
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
                {'No active DApp sessions'}
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
})
