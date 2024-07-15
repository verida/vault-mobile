import Clipboard from '@react-native-clipboard/clipboard'
import React, { useCallback } from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'
import Snackbar from 'react-native-snackbar' // TODO: Harmonise the snackbar following Figma design
import Icon from 'react-native-vector-icons/Ionicons'

import { Logger } from '~/features/telemetry'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

const logger = Logger.create('CopyToClipboardButton')

export type CopyToClipboardButtonProps = {
  content: string
  disabled?: boolean
  size?: number
} & ViewProps

// TODO: Factorise the base of this component into a IconButton
export const CopyToClipboardButton: React.FunctionComponent<
  CopyToClipboardButtonProps
> = (props) => {
  const { content, disabled, size = 24, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  const handleButtonPress = useCallback(async () => {
    try {
      Clipboard.setString(content)
      Snackbar.show({
        text: 'Copied',
        duration: Snackbar.LENGTH_SHORT,
      })
    } catch (error: unknown) {
      logger.error(error)
    }
  }, [content])

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleButtonPress}
          disabled={disabled}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={styles.button}>
          <Icon name='copy-outline' size={size} />
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
