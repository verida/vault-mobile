import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import Text from '../Text'

import { findTypeById } from '../../helpers/inbox'
import {
  BLACK_COLOR_OPACITY,
  LIGHTGREY_COLOR,
  ORANGE_COLOR,
} from '../../constants/color'

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'
import { useNavigation } from '@react-navigation/native'
import VeridaSvg from 'assets/icons/verida.svg'

export default ({ options }) => {
  const navigation = useNavigation()
  const inboxType = findTypeById(options.type)

  const onPress = () =>
    navigation.navigate('InboxItem', { inboxItemId: options.id })

  return (
    <TouchableOpacity
      style={[style.card, !options.read ? style.unread : '']}
      onPress={onPress}>
      {options.logo ? (
        <Image source={options.logo} style={style.logo} />
      ) : (
        <VeridaSvg />
      )}
      <View style={style.details}>
        <View style={style.tile}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={style.title}>{options.title} </Text>
            </View>
          </View>
          <Text style={style.date}>{options.createdAt}</Text>
        </View>
        <View>
          {Boolean(options.from) && (
            <Text style={style.from}>{options.from} </Text>
          )}
        </View>
        <View style={{ ...style.tile, ...style.footer }}>
          <Text style={{ ...style.text, marginTop: 4 }}>{inboxType.title}</Text>
          {inboxType.svg && inboxType.svg()}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const style = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
    borderRadius: 4,
    marginBottom: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  logo: {
    width: 40,
    height: 40,
    borderColor: LIGHTGREY_COLOR,
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    alignItems: 'center',
    marginRight: 55,
    fontFamily: NUNITO_SANS_BOLD,
    marginBottom: 5,
  },
  text: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 13,
    lineHeight: 18,
  },
  from: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: NUNITO_SANS_BOLD,
    color: BLACK_COLOR_OPACITY(0.6),
  },
  tile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    marginTop: 10,
  },
  details: {
    paddingLeft: 15,
    flexDirection: 'column',
    flex: 1,
  },
  unread: {
    borderColor: ORANGE_COLOR,
  },
  date: {
    color: BLACK_COLOR_OPACITY(0.6),
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 13,
    marginTop: 3,
    marginLeft: -45,
  },
})
