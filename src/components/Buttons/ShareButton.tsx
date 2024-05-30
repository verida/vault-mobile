import React, { useCallback } from 'react'
import {
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

import { Logger } from '~/features/telemetry'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

const logger = Logger.create('ShareButton')

export type ShareButtonProps = {
  title?: string
  content: string
} & ViewProps

// TODO: Factorise the base of this component into a IconButton
export const ShareButton: React.FunctionComponent<ShareButtonProps> = (
  props
) => {
  const { content, title, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  const handleButtonPress = useCallback(async () => {
    try {
      await Share.share(
        content?.startsWith('http')
          ? {
              title,
              url: content,
            }
          : {
              title,
              message: content,
            }
      )
    } catch (error: unknown) {
      logger.error(error)
    }
  }, [content, title])

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleButtonPress}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={styles.button}>
          <Icon name='share-outline' size={24} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    button: {
      padding: theme.spacing.sm,
      borderRadius: theme.roundness.m,
      backgroundColor: theme.color.grey120,
    },
  })
