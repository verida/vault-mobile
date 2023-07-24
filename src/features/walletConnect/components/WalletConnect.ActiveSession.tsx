import { AccountId, ChainId } from 'caip'
import { Spacer } from 'components'
import {
  CaipSupportedProtocolSpan,
  getMaybeChainMetadatas,
  useChainMetadatas,
} from 'features/caip'
import {
  WalletConnectButtonDisconnectSession,
  WalletConnectSessionInfoCard,
  WalletConnectSessionNamespaces,
} from 'features/walletConnect'
import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { text } from 'styles'

import { CaipProtocolToCaipIdentifiers } from '../@types'
import {
  useActiveWalletConnectSession,
  useActiveWalletConnectSessionCaipProtocolToCaipIdentifiers,
  useActiveWalletConnectSessionExpiry,
  useActiveWalletConnectSessionNamespaces,
  useActiveWalletConnectSessionPeerId,
} from '../hooks'

export const WalletConnectActiveSession = React.memo(
  function WalletConnectActiveSession({
    walletConnectSessionKey,
    onSessionDeleted,
  }: {
    readonly walletConnectSessionKey: string
    readonly onSessionDeleted: () => void
  }): JSX.Element {
    const maybeActiveSession = useActiveWalletConnectSession({
      walletConnectSessionKey,
    })

    const maybePeerId = useActiveWalletConnectSessionPeerId({
      walletConnectSessionKey,
    })

    const namespaces = useActiveWalletConnectSessionNamespaces({
      walletConnectSessionKey,
    })

    const maybeExpiry = useActiveWalletConnectSessionExpiry({
      walletConnectSessionKey,
    })

    const caipProtocolsToCaipIdentifiers: CaipProtocolToCaipIdentifiers =
      useActiveWalletConnectSessionCaipProtocolToCaipIdentifiers({
        walletConnectSessionKey,
      })

    const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

    return (
      <>
        <WalletConnectSessionInfoCard maybeActiveSession={maybeActiveSession} />

        <Spacer height={16} />

        {Boolean(Object.keys(namespaces).length) && (
          <WalletConnectSessionNamespaces
            walletConnectSessionKey={walletConnectSessionKey}
          />
        )}

        {Object.entries(caipProtocolsToCaipIdentifiers)
          .filter(([_, accounts]) => Boolean(accounts.length) /* non-empty */)
          .flatMap(
            /* network */
            ([caipProtocol, accountsForChain]) => {
              const caipTypesFromAccounts = accountsForChain.flatMap(
                (account) => new AccountId(account).chainId
              )
              const supportedCaipTypes = [...new Set(caipTypesFromAccounts)]

              return [
                <View style={styles.row} key={caipProtocol}>
                  <Text style={styles.label}>{caipProtocol} Network</Text>
                  <Text style={styles.value}>
                    {supportedCaipTypes
                      .flatMap((caipType) => new ChainId(caipType))
                      .flatMap((caipChainId: ChainId, i, orig) => [
                        <CaipSupportedProtocolSpan
                          key={caipChainId.toString()}
                          chainMetadatas={chainMetadatas}
                          caipChainId={caipChainId}
                        />,
                        i < orig.length - 1 ? (
                          // eslint-disable-next-line react/no-children-prop
                          <Text children=',' key={String(i)} />
                        ) : undefined,
                      ])}
                  </Text>
                </View>,
                /* network accounts */
                // TODO: we used to filter these to only render one - necessary?
                ...accountsForChain.map((accountForChain: string) => (
                  <View
                    style={styles.row}
                    key={`${caipProtocol}_${accountForChain}`}>
                    {/* eslint-disable-next-line react/no-children-prop */}
                    <Text children='Account ID' style={styles.label} />
                    {/* eslint-disable-next-line react/no-children-prop */}
                    <Text children={accountForChain} style={styles.value} />
                  </View>
                )),
              ]
            }
          )}

        {Boolean(maybePeerId) && (
          <View style={styles.row}>
            {/* eslint-disable-next-line react/no-children-prop */}
            <Text style={styles.label} children='PeerId' />
            <Text
              // eslint-disable-next-line react/no-children-prop
              children={maybePeerId}
              style={styles.value}
            />
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
          onSessionDeleted={onSessionDeleted}
        />
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
})
