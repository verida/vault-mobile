import React from 'react'
import {
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import {
  BLACK_COLOR,
  LIGHTGREY_COLOR,
  PRIMARY_COLOR,
  SUCCESS_COLOR,
  VERY_LIGHTGREY_COLOR,
  WHITE_COLOR,
} from '~/constants/color'

import { Text } from './Typography/Text'

type Type = 'light' | 'dark'

export type TCCheckboxProps = Omit<ViewProps, 'children'> & {
  checked: boolean
  onToggle: () => void
  type?: Type
}

function TCCheckbox(props: TCCheckboxProps) {
  const { checked, style, type, onToggle, ...rest } = props

  async function onLinkPress() {
    const url = 'https://www.verida.io/vault/terms-and-conditions'
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      Linking.openURL(url)
    }
  }

  return (
    <View {...rest} style={[style, styles.container]}>
      <TouchableOpacity
        onPress={onToggle}
        hitSlop={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        {!checked ? (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: LIGHTGREY_COLOR,
              backgroundColor: VERY_LIGHTGREY_COLOR,
            }}
          />
        ) : (
          <AntDesign name='checkcircle' size={20} color={SUCCESS_COLOR} />
        )}
      </TouchableOpacity>
      <Text
        style={[
          styles.text,
          { color: type === 'light' ? WHITE_COLOR : BLACK_COLOR },
        ]}>
        I accept the{' '}
        <Text
          onPress={onLinkPress}
          style={[
            styles.link,
            { color: type === 'light' ? WHITE_COLOR : PRIMARY_COLOR },
          ]}>
          terms and conditions
        </Text>
      </Text>
    </View>
  )
}

TCCheckbox.defaultProps = {
  type: 'dark',
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 10,
    fontSize: 16,
  },
  link: {
    textDecorationLine: 'underline',
    fontSize: 16,
  },
})

export default TCCheckbox
