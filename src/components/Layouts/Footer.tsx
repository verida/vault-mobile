import { useTheme } from 'contexts/ThemeContext'
import React, { FC } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Shadow } from 'react-native-shadow-2'

import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

const Footer: FC<ViewProps> = (props) => {
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  return (
    <SafeAreaView edges={['left', 'bottom', 'right']}>
      <Shadow
        offset={[0, -1]}
        distance={1}
        startColor={theme.color.shadowLightGrey}
        endColor={theme.color.shadowLightGrey}
        style={{ width: '100%' }}>
        <View style={styles.footer}>{props.children}</View>
      </Shadow>
    </SafeAreaView>
  )
}

export default Footer

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    footer: {
      backgroundColor: theme.color.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
    },
  })
