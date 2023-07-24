import * as React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { Spacer } from 'components/Spacer'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import iconStyle from 'styles/icon'

import { MaybeActiveSession } from '../@types'

export const WalletConnectSessionInfoCard = React.memo(
  function WalletConnectSessionInfoCard({
    maybeActiveSession,
  }: {
    readonly maybeActiveSession: MaybeActiveSession
  }): JSX.Element {
    const maybePeerMetadata = maybeActiveSession?.peer?.metadata

    return (
      <View style={styles.container}>
        {/* TODO: We are doing this in different places, should be a common component */}
        <Image
          style={iconStyle.large}
          source={{
            // TODO: What is the default image to use? (i.e. || WalletConnectLogoUri)?
            uri: maybePeerMetadata?.icons?.[0],
          }}
        />
        <Spacer height={8} />
        <Text style={styles.title}>{maybePeerMetadata?.name}</Text>
        <Spacer height={8} />
        <Text style={styles.url}>{maybePeerMetadata?.url}</Text>
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    textAlign: 'center',
  },
  permission: {
    fontSize: 14,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    textAlign: 'center',
  },
  url: {
    color: '#8E8E93',
    fontSize: 14,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
})
