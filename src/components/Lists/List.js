import React from 'react'
import { StyleSheet } from 'react-native'
import Text from '../Text'

import { BLACK_COLOR_OPACITY } from '../../constants/color'

export default ({ items }) =>
  items.map((item, index) => (
    <Text key={`aspects-${index}`} style={[style.text, { marginTop: 16 }]}>
      &#9679; <Text style={style.text}>{item}</Text>
    </Text>
  ))

const style = StyleSheet.create({
  text: {
    color: BLACK_COLOR_OPACITY(0.6),
  },
})
