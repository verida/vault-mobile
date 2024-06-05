import * as React from 'react'
import { ScrollView, View } from 'react-native'

import { Spacer } from '~/components'
import { WalletConnectActiveSession } from '~/features/walletConnect'
import { MainStackScreenProps } from '~/navigation/types'
import { LAYOUT_BASE } from '~/styles'

export type WalletConnectActiveSessionDetailsScreenParams = {
  walletConnectSessionKey: string
}

type WalletConnectActiveSessionDetailsScreenProps =
  MainStackScreenProps<'WalletConnectActiveSessionDetails'>

/**
 * TODO: Make a decision whether to name session or connection, update either the component name (and related elements) or the user-facing screen title and other references
 */
export const WalletConnectActiveSessionDetailsScreen: React.FC<
  WalletConnectActiveSessionDetailsScreenProps
> = (props) => {
  const {
    navigation,
    route: { params },
  } = props

  const { walletConnectSessionKey } = params

  React.useEffect(() => {
    navigation.setOptions({
      title: 'DApp connection',
    })
  }, [navigation])

  return (
    // TODO: Use ScreenWrapper
    <View>
      <View style={LAYOUT_BASE}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <WalletConnectActiveSession
            onSessionDeleted={navigation.goBack}
            walletConnectSessionKey={walletConnectSessionKey}
          />
          <Spacer height={250} />
        </ScrollView>
      </View>
    </View>
  )
}
