import { Spacer } from 'components'
import { WalletConnectActiveSession } from 'features/walletConnect'
import { Icon } from 'native-base'
import * as React from 'react'
import { ScrollView, View } from 'react-native'
import { LAYOUT_BASE } from 'styles'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackScreenProps } from 'navigation/types'

export type WalletConnectActiveSessionDetailsScreenParams = {
  walletConnectSessionKey: string
}

type WalletConnectActiveSessionDetailsScreenProps =
  MainStackScreenProps<'WalletConnectActiveSessionDetails'>

export const WalletConnectActiveSessionDetailsScreen: React.FC<WalletConnectActiveSessionDetailsScreenProps> =
  (props) => {
    const {
      navigation,
      route: { params },
    } = props
    const { walletConnectSessionKey } = params

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
