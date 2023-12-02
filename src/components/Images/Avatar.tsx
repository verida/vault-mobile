import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import FastImage, { Source } from 'react-native-fast-image'

import { Theme } from 'styles/types'

// TODO: Refactor the location of the default avatars inside 'assets'
const UserAvatar = require('assets/stubs/avatar.png')
const AppAvatar = require('assets/placeholder-app-logo.png')
// TODO: Get a avatar image for entity
// TODO: Get a avatar image for wallet
// TODO: Get a generic avatar image

// TODO: Allow a text as fallback
// With a text as fallback, we'll need to handle the size differently as we can't adapt the font size based on the container size (apparently)

export type AvatarFallbackType =
  | 'person'
  | 'entity'
  | 'app'
  | 'wallet'
  | 'generic'

export type AvatarProps = {
  source?: string | Source
  fallbackType?: AvatarFallbackType
} & ViewProps

export const Avatar: React.FunctionComponent<AvatarProps> = (props) => {
  const { source, fallbackType = 'generic', ...viewProps } = props

  const defaultSource = fallbackType === 'person' ? UserAvatar : AppAvatar
  const imageSource = source
    ? typeof source === 'string'
      ? { uri: source }
      : source
    : defaultSource

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <FastImage
        style={styles.image}
        source={imageSource}
        resizeMode={FastImage.resizeMode.cover}
        defaultSource={defaultSource}
      />
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    image: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: theme.roundness.full,
      backgroundColor: theme.color.lightGrey,
    },
  })
