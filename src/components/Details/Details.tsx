import React from 'react'
import { StyleSheet, View } from 'react-native'

import Text from '~/components/Text'
import { BLACK_COLOR_OPACITY } from '~/constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '~/constants/text'

export interface DetailsProps {
  title: string
  text: string
}

export const Details: React.FC<DetailsProps> = (props) => (
  <View style={style.container}>
    <Text style={style.title}>{props.title}</Text>
    <Text style={style.text}>{props.text}</Text>
  </View>
)

const style = StyleSheet.create({
  container: {
    marginTop: 32,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 20,
  },
  text: {
    marginTop: 2,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR_OPACITY(0.8),
    fontSize: 18,
  },
})
