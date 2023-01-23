import React, { FC } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

const Footer: FC<ViewProps> = (props) => {
  const styles = useThemeAwareStyle(createStyles)

  return (
    <SafeAreaView edges={['left', 'bottom', 'right']}>
      <View style={styles.footer}>{props.children}</View>
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

      shadowColor: theme.color.shadowLightGrey,
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 5,
    },
  })
