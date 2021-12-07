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

import Text from './Text'
import { GREY_COLOR, SUCCESS_COLOR } from 'constants/color'

export type TCCheckboxProps = Omit<ViewProps, 'children'> & {
  checked: boolean
  onToggle: () => void
}

function TCCheckbox(props: TCCheckboxProps) {
  const { checked, style, onToggle, ...rest } = props

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
      <Text style={styles.text}>
        I agree and accept the{' '}
        <Text onPress={onLinkPress} style={styles.link}>
          terms and conditions
        </Text>
      </Text>
    </View>
  )
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
