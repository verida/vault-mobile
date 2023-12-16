import { ScreenWrapper } from 'components'
import { useTheme } from 'contexts'
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

  return (
    <ScreenWrapper
      safeAreaEdges={['left', 'right']}
      backgroundColor={theme.color.snow}>
      <View style={styles.container}>
        <View style={styles.section}>
          <WalletSummary />
        </View>
        <View style={[styles.section, styles.promoBannersCarouselSection]}>
          <PromotionalBannersCarousel />
        </View>
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
