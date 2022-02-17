import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import { BLACK_COLOR } from '../../constants/color'
import { NUNITO_SANS_BOLD } from '../../constants/text'
import Text from '../Text'

export default (props) => {
  return (
    <ScrollView contentContainerStyle={[style.container, props.style]}>
      {props.title && <Text style={style.title}>{props.title}</Text>}
      {props.children}
    </ScrollView>
  )
}

const style = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 16,
    fontSize: 22,
    lineHeight: 41,
    fontFamily: NUNITO_SANS_BOLD,
    color: BLACK_COLOR,
  },
})
