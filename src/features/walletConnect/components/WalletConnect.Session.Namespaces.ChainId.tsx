import {
  useActiveWalletConnectSessionNamespace,
  WALLETCONNECT_SUPPORTED_CHAINS,
} from 'features/walletConnect'
import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import text from 'styles/text'

export const WalletConnectSessionNamespacesChainId = React.memo(
  function WalletConnectSessionNamespacesChainId({
    chain,
    veridaChainId,
    walletConnectSessionKey,
  }: {
    readonly chain: string /* walletConnect */
    readonly veridaChainId: string /* verida */
    readonly walletConnectSessionKey: string
  }): JSX.Element {
    const maybeNamespace = useActiveWalletConnectSessionNamespace({
      walletConnectSessionKey,
      chain,
    })

    const allMethods = React.useMemo(
      // TODO: missing extension support
      //       https://github.com/verida/vault-mobile/blob/1d34080ed6ca9e8a821e0c7c9c33c2e62dc88a42/src/components/WalletConnect/SessionChainCard.tsx#L27
      () => maybeNamespace?.methods || [],
      [maybeNamespace]
    )

    const allEvents = React.useMemo(
      // TODO: missing extension support
      //       https://github.com/verida/vault-mobile/blob/1d34080ed6ca9e8a821e0c7c9c33c2e62dc88a42/src/components/WalletConnect/SessionChainCard.tsx#L27
      () => maybeNamespace?.events || [],
      [maybeNamespace]
    )

    // TODO: This is https://github.com/verida/vault-mobile/blob/1d34080ed6ca9e8a821e0c7c9c33c2e62dc88a42/src/wallet-connect/helpers/HelperUtil.ts#L106
    //       Verify if we need to generalize this usage.
    const maybeChainName =
      WALLETCONNECT_SUPPORTED_CHAINS[veridaChainId]?.name || veridaChainId

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {/* eslint-disable-next-line react/no-children-prop */}
          <Text children={maybeChainName} style={styles.label} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Methods</Text>
          <Text style={styles.value}>
            {allMethods.length ? allMethods.join(', ') : '-'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Events</Text>
          <Text style={styles.value}>
            {allEvents.length ? allEvents.join(', ') : '-'}
          </Text>
        </View>
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    minWidth: '20%',
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
})
