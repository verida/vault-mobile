import {
  useWalletConnectContext,
  WalletConnectSessionItem,
} from 'features/walletConnect'
import * as React from 'react'
import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { LayoutStyle, text } from 'styles'

import Layout from 'components/Layouts/Layout'
import { Spacer } from 'components/Spacer'
import Text from 'components/Text'
import { MainStackScreenProps } from 'navigation/types'

export type WalletConnectActiveSessionsScreenParams = undefined

type WalletConnectActiveSessionsScreenProps =
  MainStackScreenProps<'WalletConnectActiveSessions'>

/**
 * TODO: Make a decision whether to name session or connection, update either the component name (and related elements) or the user-facing screen title and other references
 */
export const WalletConnectActiveSessionsScreen: React.FC<
  WalletConnectActiveSessionsScreenProps
> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'DApp Connections',
    })
  }, [navigation])

  const { activeSessions: defaultActiveSessions } = useWalletConnectContext()

  const activeSessions = Object.keys(defaultActiveSessions)

  return (
    // TODO: Use ScreenWrapper
    <View style={styles.flex}>
      <Layout style={[LayoutStyle.layout]}>
        {activeSessions.length ? (
          <>
            <Text style={styles.title}>Active DApp Sessions</Text>
            <Spacer height={32} />
            {
              // TODO: Use a List component
              activeSessions.map((walletConnectSessionKey) => (
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
              ))
            }
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
