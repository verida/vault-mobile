import { ScreenWrapper } from 'components'
import { useTheme } from 'contexts'
import { useConfig } from 'features/config'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import {
  GettingStarted,
  PromotionalBannersCarousel,
  WalletSummary,
} from 'components/Home'
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

  const hidePromoBanners = config.features.home.hidePromoBanners

  return (
    <ScreenWrapper
      safeAreaEdges={['left', 'right']}
      backgroundColor={theme.color.snow}>
      <View style={styles.container}>
        <View style={styles.section}>
          <WalletSummary />
        </View>
        {hidePromoBanners ? null : (
          <PromotionalBannersCarousel
            style={[styles.section, styles.promoBannersCarouselSection]}
          />
        )}
        <View style={styles.section}>
          <GettingStarted />
        </View>
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
    promoBannersCarouselSection: {
      marginLeft: -theme.spacing.m,
      marginRight: -theme.spacing.m,
    },
  })
