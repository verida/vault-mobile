import React, { useCallback, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { BottomActionBar, ScreenWrapper, StatusInfo } from '~/components'
import { AggregateWalletBannerBalance } from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

export type TransactionFailureScreenParams = {
  readonly errorMessage: string
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

type TransactionFailureScreenProps = MainStackScreenProps<'TransactionFailure'>

export const TransactionFailureScreen: React.FC<
  TransactionFailureScreenProps
> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const { errorMessage, aggregateWalletBannerBalance } = params

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    })
  }, [navigation])

  const { resource, label: title } = aggregateWalletBannerBalance

  const statusTitle = 'Transaction failed!'
  const statusSubtitle = errorMessage

  const handleCloseButtonPress = useCallback(() => {
    navigation.navigate('SingleCurrency', {
      resource,
      title,
    })
  }, [navigation, resource, title])

  const styles = useThemeAwareStyle(createStyles)

  return (
    <ScreenWrapper allSafeAreaEdges>
      <View style={styles.container}>
        <StatusInfo
          statusType='error'
          title={statusTitle}
          subtitle={statusSubtitle}
        />
      </View>
      <BottomActionBar
        hideBorder
        actions={[
          {
            label: 'Close',
            onPress: handleCloseButtonPress,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.l,
      paddingHorizontal: theme.spacing.m,
    },
  })
}
