import { Spacer } from 'components'
import { WalletConnectActiveSession } from 'features/walletConnect'
import * as React from 'react'
import { ScrollView, View } from 'react-native'
import { LAYOUT_BASE } from 'styles'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackScreenProps } from 'navigation/types'

import LeftArrowIcon from '../../assets/left_arrow_icon.svg'

export type WalletConnectActiveSessionDetailsParams = {
  walletConnectSessionKey: string
}

export const WalletConnectActiveSessionDetails = React.memo(
  function WalletConnectActiveSessionDetails({
    navigation,
    route: {
      params: { walletConnectSessionKey },
    },
  }: MainStackScreenProps<'WalletConnectActiveSessionDetails'>): JSX.Element {
    return (
      <View>
        <NavigationHeader
          title='Session Details'
          left={React.useMemo(
            () => ({
              icon: <LeftArrowIcon />,
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
)
