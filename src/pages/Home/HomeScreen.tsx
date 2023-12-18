import {
  HomeCryptoWalletOverview,
  HomeGettingStarted,
  HomePromoBanners,
  ScreenWrapper,
} from 'components'
import { useTheme } from 'contexts'
import { useConfig } from 'features/config'
import { useHomeScreenHandlers } from 'features/homeScreen'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { TabsScreenProps } from 'navigation/types'
import SeedPhraseRemindView from 'pages/Dashboard/SeedPhraseRemindView'
import { Theme } from 'styles/types'

export type HomeScreenParams = undefined

type HomeScreenProps = TabsScreenProps<'Home'>

export const HomeScreen: React.FunctionComponent<HomeScreenProps> = (
  _props
) => {
  // TODO: Do we display the seed phrase reminder here, like in the previous Home screen?

  useHomeScreenHandlers() // TODO: To uncomment after removing the previous Home screen

  const styles = useThemeAwareStyle(createStyle)
  const { theme } = useTheme()

  const { config } = useConfig()

  const hideCryptoWalletOverview = config.features.home.hideCryptoWalletOverview
  const hidePromoBanners = config.features.home.hidePromoBanners
  const hideGettingStarted = config.features.home.hideGettingStarted

  return (
    <>
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
        <SeedPhraseRemindView style={styles.seedPhraseRemindView} />
      </ScreenWrapper>
    </>
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
    seedPhraseRemindView: {
      position: 'absolute',
      bottom: theme.spacing.m,
      left: theme.spacing.m,
      right: theme.spacing.m,
      backgroundColor: theme.color.lightOrange,
      borderRadius: theme.roundness.xs,
      borderWidth: 1,
      borderColor: theme.color.orange,
    },
  })
