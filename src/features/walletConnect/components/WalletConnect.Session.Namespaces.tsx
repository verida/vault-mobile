import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { text } from '~/styles'

import { useActiveWalletConnectSessionChains } from '../hooks'
import { WalletConnectSessionChainCard } from './WalletConnect.Session.ChainCard'

export const WalletConnectSessionNamespaces = React.memo(
  function WalletConnectSessionNamespaces({
    walletConnectSessionKey,
  }: {
    readonly walletConnectSessionKey: string
  }): JSX.Element {
    const chains = useActiveWalletConnectSessionChains({
      walletConnectSessionKey,
    })
    return (
      <>
        {chains.map((chain) => {
          return (
            <React.Fragment key={chain}>
              <View style={styles.row}>
                <Text
                  style={text.primary}>{`Review ${chain} permissions`}</Text>
              </View>
              <WalletConnectSessionChainCard
                chain={chain}
                walletConnectSessionKey={walletConnectSessionKey}
              />
            </React.Fragment>
          )
        })}
      </>
    )
  }
)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
})
