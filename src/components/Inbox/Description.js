import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Text from '../Text'

import { BLACK_COLOR_OPACITY, LIGHTGREY_COLOR } from '../../constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'

export default ({ details }) => {
  return (
    <View style={style.card}>
      <Image style={style.logo} source={{ uri: details.uri }} />
      <View style={style.tile}>
        <Text style={style.organization}>{details.name}</Text>
        <Text style={style.text}>{details.createdAt}</Text>
      </View>
    </View>
  )
}

const style = StyleSheet.create({
  card: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: LIGHTGREY_COLOR,
    borderWidth: 1,
  },
  tile: {
    marginLeft: 16,
  },
  organization: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
    lineHeight: 25,
    marginRight: 60,
  },
  text: {
    color: BLACK_COLOR_OPACITY(0.6),
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 13,
    lineHeight: 18,
  },
})
