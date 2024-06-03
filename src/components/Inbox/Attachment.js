import React from 'react'
import { StyleSheet, View } from 'react-native'

import FileSvg from '~/assets/inbox/file.svg'
import Text from '~/components/Text'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '~/constants/text'

export default ({ options }) => {
  return (
    <View style={style.container}>
      <FileSvg />
      <View style={style.description}>
        <Text style={style.title}>{options.title}</Text>
        <Text style={style.text}>{options.size}</Text>
      </View>
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.5,
  },
  description: {
    paddingLeft: 12,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 15,
  },
  text: {
    fontSize: 13,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    lineHeight: 18,
  },
})
