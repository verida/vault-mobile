import React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import FastImage from 'react-native-fast-image'

import { NUNITO_SANS_BOLD } from '~/constants/text'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

// TODO: Add fallback image

export type LogoProps = {
  uri?: string
  alt?: string
} & ViewProps

/**
 * @deprecated Use `Avatar` instead
 */
export const Logo: React.FunctionComponent<LogoProps> = (props) => {
  const { uri, alt, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      {uri ? (
        <FastImage source={{ uri }} style={styles.layout} />
      ) : alt && alt.length > 0 ? (
        <View style={[styles.layout, styles.fallbackContainer]}>
          <Text style={styles.textFallback}>{alt.charAt(0)}</Text>
        </View>
      ) : null}
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    layout: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: theme.roundness.full,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: theme.color.lightGrey,
      backgroundColor: theme.color.lightGrey,
    },
    fallbackContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textFallback: {
      // TODO: Find a way to adapt the font size based on the size of the component
      fontFamily: NUNITO_SANS_BOLD,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
  })
