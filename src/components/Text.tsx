import React from 'react'
import { StyleSheet, Text as RNText, TextProps } from 'react-native'

import { BLACK_COLOR } from '../constants/color'
import { NUNITO_SANS } from '../constants/text'

const Text: React.FC<TextProps> = (props) => {
  const { style, children, ...rest } = props
  return (
    <RNText style={[styles.text, style]} {...rest}>
      {children}
    </RNText>
  )
}

const styles = StyleSheet.create({
  text: {
    color: BLACK_COLOR,
    fontFamily: NUNITO_SANS,
    textAlignVertical: 'center',
    fontSize: 14,
  },
})

export default Text
