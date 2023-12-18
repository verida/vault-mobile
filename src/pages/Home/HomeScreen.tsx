import {
  HomeCryptoWalletOverview,
  HomeGettingStarted,
  HomePromoBanners,
  ScreenWrapper,
} from 'components'
import { useTheme } from 'contexts'
import { useConfig } from 'features/config'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { TabsScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

export type HomeScreenParams = undefined

type HomeScreenProps = TabsScreenProps<'NewHome'>

export const HomeScreen: React.FunctionComponent<HomeScreenProps> = (
  _props
) => {
  const styles = useThemeAwareStyle(createStyle)
  const { theme } = useTheme()

  const { config } = useConfig()

  const hideCryptoWalletOverview = config.features.home.hideCryptoWalletOverview
  const hidePromoBanners = config.features.home.hidePromoBanners
  const hideGettingStarted = config.features.home.hideGettingStarted

  return (
    <ScreenWrapper
      safeAreaEdges={['left', 'right']}
      backgroundColor={theme.color.snow}>
      <View style={styles.container}>
        {hideCryptoWalletOverview ? null : (
          <HomeCryptoWalletOverview style={styles.section} />
        )}
        {hidePromoBanners ? null : (
          <HomePromoBanners
            style={[styles.section, styles.promoBannersSection]}
          />
        )}
        {hideGettingStarted ? null : (
          <HomeGettingStarted
            style={[styles.section, styles.gettingStartedSection]}
          />
        )}
      </View>
    </ScreenWrapper>
  )
}

const createStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.m,
    },
    section: {
      marginBottom: theme.spacing.m,
    },
    promoBannersSection: {
      marginLeft: -theme.spacing.m,
      marginRight: -theme.spacing.m,
    },
    gettingStartedSection: {
      flex: 1,
    },
  })
