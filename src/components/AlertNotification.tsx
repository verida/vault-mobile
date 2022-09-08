import React, { useEffect } from 'react'
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import Text from 'components/Text'
import {
  LIGHT_ORANGE_COLOR,
  LIGHT_SUCCESS_COLOR,
  SUCCESS_COLOR,
} from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

import { ORANGE_COLOR } from '../constants/color'

const { width: SCREEN_WIDTH } = Dimensions.get('screen')

const MILISECONDS = 1000

export type AlertNotificationProps = Omit<ViewProps, 'children'> & {
  isOpened: boolean
  onClosePress: () => void
  title: string
  bodyText: string
  type: 'success' | 'failure'
  timeOutInSeconds: number
}
const AlertNotification = (props: AlertNotificationProps) => {
  const {
    isOpened,
    onClosePress,
    title,
    bodyText,
    type,
    timeOutInSeconds = 3 * MILISECONDS,
    style,
    ...rest
  } = props

  useEffect(() => {
    if (isOpened) {
      setTimeout(() => {
        onClosePress()
      }, timeOutInSeconds * MILISECONDS)
    }
  }, [isOpened, onClosePress, timeOutInSeconds])

  const backgroundColorStyle = {
    backgroundColor:
      type === 'success' ? LIGHT_SUCCESS_COLOR : LIGHT_ORANGE_COLOR,
  }

  if (!isOpened) {
    return null
  }

  return (
    <View style={[styles.container, style, backgroundColorStyle]} {...rest}>
      <View style={styles.header}>
        <AntDesign
          name='exclamationcircleo'
          size={16}
          color={type === 'success' ? SUCCESS_COLOR : ORANGE_COLOR}
        />
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={onClosePress}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
          <AntDesign name='close' size={16} color='black' />
        </TouchableOpacity>
      </View>
      <Text style={styles.message}>{bodyText}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 15,
    alignItems: 'stretch',
    position: 'absolute',
    left: 15,
    width: SCREEN_WIDTH - 30,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: SUCCESS_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
  },
  message: {
    fontSize: 12,
  },
})

export default AlertNotification
