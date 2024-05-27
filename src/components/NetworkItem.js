import React from 'react'
import { StyleSheet, View } from 'react-native'
import { CheckBox } from 'react-native-elements'

import { LIGHTGREY_COLOR, SUCCESS_COLOR } from '~/constants/color'
import { NUNITO_SANS_SEMIBOLD } from '~/constants/text'

import Text from './Text'

export default ({ network, selected, onSelect }) => {
  return (
    <View style={style.container}>
      <View style={style.description}>
        {network.logo}
        <Text style={style.title}>{network.title}</Text>
      </View>
      <CheckBox
        containerStyle={style.checkbox}
        iconType='material'
        checkedIcon='check-circle'
        uncheckedIcon='radio-button-unchecked'
        checkedColor={SUCCESS_COLOR}
        uncheckedColor={LIGHTGREY_COLOR}
        size={20}
        checked={selected}
        onPress={() => onSelect(network.id)}
      />
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
    paddingHorizontal: 15,
    paddingVertical: 9,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  description: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 12,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 16,
  },
  checkbox: {
    padding: 0,
  },
})
