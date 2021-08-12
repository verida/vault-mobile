import React from 'react'
import { StyleSheet, Text } from 'react-native'

import { BLACK_COLOR_OPACITY } from '../constants/color'
import { NUNITO_SANS_SEMIBOLD } from '../constants/text'

export default (props) => {
  return <Text style={[style.label, props.style]}>{props.children}</Text>
}

const style = StyleSheet.create({
  label: {
    marginTop: 16,
    marginBottom: 4,
    fontSize: 12,
    color: BLACK_COLOR_OPACITY(0.8),
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
})
