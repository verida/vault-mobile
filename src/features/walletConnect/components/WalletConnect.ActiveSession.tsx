import { Spacer } from 'components'
import {
  CaipSupportedProtocolSpan,
  maybeParseCaip,
  ParsedCaipType,
  stringifyCaip,
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
              const supportedCaipTypes = [
                ...new Set(
                  accountsForChain.flatMap((accountForChain) => {
                    const maybeParsedCaip = maybeParseCaip(accountForChain)

                    if (!maybeParsedCaip) return []

                    return [
                      stringifyCaip({
                        parsedCaipType: maybeParsedCaip,
                        suppressAddressComponent: false,
                      }),
                    ]
                  })
                ),
              ]

              return [
                <View style={styles.row} key={caipProtocol}>
                  <Text style={styles.label}>{caipProtocol} Network</Text>
                  <Text style={styles.value}>
                    {supportedCaipTypes
                      .flatMap((caipType) => {
                        const maybeParsedCaip = maybeParseCaip(caipType)
                        return maybeParsedCaip ? [maybeParsedCaip] : []
                      })
                      .flatMap((parsedCaipType: ParsedCaipType, i, orig) => [
                        <CaipSupportedProtocolSpan
                          key={stringifyCaip({
                            parsedCaipType,
                            suppressAddressComponent: false,
                          })}
                          parsedCaipType={parsedCaipType}
                        />,
                        // eslint-disable-next-line react/no-children-prop
                        i < orig.length - 1 ? <Text children=',' /> : undefined,
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
