import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useMaybeNearWalletAddresses } from 'features/near'
import {
  useActiveWalletConnectSessionExpiry,
  useActiveWalletConnectSessionNamespaces,
  WalletConnectButtonDisconnectSession,
  WalletConnectSessionInfoCard,
  WalletConnectSessionNamespaces,
} from 'features/walletConnect'
import { Icon } from 'native-base'
import * as React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { LayoutStyle, text } from 'styles'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import { Spacer } from 'components/Spacer'
import { MainStackParams } from 'navigation/types'

export const WalletConnectDapps = React.memo(
  function WalletConnectDapps(): JSX.Element {
    const navigation =
      useNavigation<NativeStackNavigationProp<MainStackParams>>()
    const {
      params: { walletConnectSessionKey },
    } = useRoute<RouteProp<MainStackParams, 'WalletConnectDapps'>>()

    const namespaces = useActiveWalletConnectSessionNamespaces({
      walletConnectSessionKey,
    })

    const maybeExpiry = useActiveWalletConnectSessionExpiry({
      walletConnectSessionKey,
    })

    const nearAddresses = useMaybeNearWalletAddresses()

    // TODO: This used to be just near, and would create etc. But we need to treat near like any other wallet, yes?
    // TODO: What address to render? Near or Ethereum? Is it based on the selected chain? How to select the chain?

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
        <View style={LayoutStyle.layout}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContainer}>
            <WalletConnectSessionInfoCard
              walletConnectSessionKey={walletConnectSessionKey}
            />

            <Spacer height={16} />

            {Boolean(Object.keys(namespaces).length) && (
              <WalletConnectSessionNamespaces
                walletConnectSessionKey={walletConnectSessionKey}
              />
            )}

            {/* TODO: render all addresses? how to associate session to addresses? */}
            {nearAddresses?.[0] && (
              <View style={styles.row}>
                <Text style={styles.label}>Account ID</Text>
                <Text style={styles.value}>{nearAddresses[0]}</Text>
              </View>
            )}

            {Boolean(maybeExpiry) && (
              <View style={styles.row}>
                {/* eslint-disable-next-line react/no-children-prop */}
                <Text style={styles.label} children='Expiry' />
                <Text
                  // eslint-disable-next-line react/no-children-prop
                  children={maybeExpiry!.toDateString()}
                  style={styles.value}
                />
              </View>
            )}

            <Spacer height={32} />

            <WalletConnectButtonDisconnectSession
              walletConnectSessionKey={walletConnectSessionKey}
              onSessionDeleted={navigation.goBack}
            />
          </ScrollView>
        </View>
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    paddingBottom: 30,
  },
  scrollViewContainer: {
    paddingBottom: 32,
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
  actionButton: {
    alignSelf: 'stretch',
  },
})
