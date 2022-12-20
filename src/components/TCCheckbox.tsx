import React from 'react'
import {
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import {
  BLACK_COLOR,
  GREY_COLOR,
  SUCCESS_COLOR,
  WHITE_COLOR,
} from 'constants/color'

import Text from './Text'

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
          <MaterialCommunityIcons
            name='checkbox-blank-circle-outline'
            size={20}
            color={GREY_COLOR}
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
        I agree and accept the{' '}
        <Text
          onPress={onLinkPress}
          style={[
            styles.link,
            { color: type === 'light' ? WHITE_COLOR : BLACK_COLOR },
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
  },
  text: {
    marginLeft: 10,
  },
  link: {
    textDecorationLine: 'underline',
  },
})

export default TCCheckbox
