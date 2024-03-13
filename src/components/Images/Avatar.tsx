import { Icon, IconName } from 'components'
import { useTheme } from 'contexts'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import FastImage, { Source } from 'react-native-fast-image'

import { Theme } from 'styles/types'

export type AvatarFallbackType =
  | 'person'
  | 'entity'
  | 'app'
  | 'wallet'
  | 'generic'

// TODO: Allow a text as fallback. Difficulty is to handle the size of the text according to the size of the component
export type AvatarProps = {
  source?: string | Source
  hideBorder?: boolean
  fallbackType?: AvatarFallbackType
  fallbackColor?: string
  fallbackBackgroundColor?: string
  borderColor?: string
} & ViewProps

export const Avatar: React.FunctionComponent<AvatarProps> = (props) => {
  const { theme } = useTheme()

  const {
    source,
    fallbackType = 'generic',
    hideBorder = false,
    borderColor = theme.color.lightGrey,
    fallbackColor = theme.color.grey300,
    fallbackBackgroundColor = theme.color.veryLightGrey,
    ...viewProps
  } = props

  const fallbackName: IconName =
    fallbackType === 'person'
      ? 'user'
      : fallbackType === 'entity'
        ? 'business'
        : fallbackType === 'app'
          ? 'calculator'
          : fallbackType === 'wallet'
            ? 'wallet'
            : 'user'

  const imageSource = source
    ? typeof source === 'string'
      ? { uri: source }
      : source
    : undefined

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      {!imageSource ? (
        <View
          style={[
            styles.fallbackContainer,
            {
              backgroundColor: fallbackBackgroundColor,
              borderColor: borderColor,
            },
            !hideBorder && styles.border,
          ]}>
          <Icon name={fallbackName} size={'100%'} color={fallbackColor} />
        </View>
      ) : (
        <FastImage
          style={[
            styles.image,
            {
              borderColor: borderColor,
            },
            !hideBorder && styles.border,
          ]}
          source={imageSource}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    fallbackContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      aspectRatio: 1,
      padding: '15%',
      borderRadius: theme.roundness.full,
    },
    image: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: theme.roundness.full,
      backgroundColor: theme.color.veryLightGrey,
      borderWidth: 1,
      borderStyle: 'solid',
    },
    border: {
      borderWidth: 1,
      borderStyle: 'solid',
    },
  })
