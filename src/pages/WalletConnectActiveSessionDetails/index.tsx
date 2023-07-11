import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Spacer } from 'components'
import {
  useWalletConnectContext,
  WalletConnectActiveSession,
} from 'features/walletConnect'
import { Icon } from 'native-base'
import * as React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { LAYOUT_BASE } from 'styles'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackParams } from 'navigation/types'

export const WalletConnectActiveSessionDetails = React.memo(
  function WalletConnectActiveSessionDetails(): JSX.Element {
    const navigation =
      useNavigation<NativeStackNavigationProp<MainStackParams>>()

    const { activeSessions } = useWalletConnectContext()

    const walletConnectSessionKeys = React.useMemo(
      () => Object.keys(activeSessions),
      [activeSessions]
    )

    return (
      <View>
        <NavigationHeader
          title='Session Details'
          left={React.useMemo(
            () => ({
              icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
              action: () => navigation.goBack(),
            }),
            [navigation]
          )}
        />
        <View style={LAYOUT_BASE}>
          {walletConnectSessionKeys.length ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {walletConnectSessionKeys.map((walletConnectSessionKey) => (
                <React.Fragment key={walletConnectSessionKey}>
                  <WalletConnectActiveSession
                    onSessionDeleted={navigation.goBack}
                    walletConnectSessionKey={walletConnectSessionKey}
                  />
                </React.Fragment>
              ))}
              <Spacer height={250} />
            </ScrollView>
          ) : (
            <Text
              // eslint-disable-next-line react/no-children-prop
              children='You are not currently connected to any Dapps.'
              style={styles.emptyText}
            />
          )}
        </View>
      </View>
    )
  }
)

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
})
