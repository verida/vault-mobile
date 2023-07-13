import { SessionTypes } from '@walletconnect/typesv2'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { formatChainName } from 'wallet-connect/helpers/HelperUtil'

import text from 'styles/text'

interface IProps {
  namespace: SessionTypes.Namespace
}

export default function SessionChainCard({ namespace }: IProps) {
  const chains: string[] = []

  namespace.accounts.forEach((account: string) => {
    const [type, chain] = account.split(':')
    const chainId = `${type}:${chain}`
    chains.push(chainId)
  })

  return (
    <>
      {chains.map((chainId) => {
        const extensionMethods: SessionTypes.Namespace['methods'] = []
        const extensionEvents: SessionTypes.Namespace['events'] = []

        namespace.extension?.map(({ accounts, methods, events }) => {
          accounts.forEach((account) => {
            const [type, chain] = account.split(':')

            // TODO: This chain id generation logic should be a common function:
            //       1. Increases code reuse/testability
            //       2. Connects ideologically similar code bodies.
            if (chains.includes(`${type}:${chain}`)) {
              extensionMethods.push(...methods)
              extensionEvents.push(...events)
            }
          })
        })

        const allMethods = [...namespace.methods, ...extensionMethods]
        const allEvents = [...namespace.events, ...extensionEvents]

        return (
          <View style={styles.container} key={chainId}>
            <View style={styles.row}>
              <Text style={styles.label}>{formatChainName(chainId)}</Text>
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
      })}
    </>
  )
}

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
