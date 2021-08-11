import React from 'react'
import { StyleSheet, Text } from 'react-native'

import { BLACK_COLOR } from '../constants/color'
import { NUNITO_SANS } from '../constants/text'

export default ({ style, children, ...props }) => (
  <Text style={[styles.text, style]} {...props}>
    {children}
  </Text>
)

const styles = StyleSheet.create({
  text: {
    color: BLACK_COLOR,
    fontFamily: NUNITO_SANS,
    textAlignVertical: 'center',
    fontSize: 14,
  },
})
