import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ShimmerPlaceholder } from '~/components/ShimmerPlaceholder'
import Text from '~/components/Text'
import {
  BLACK_COLOR_OPACITY,
  LIGHTGREY_COLOR,
  ORANGE_COLOR,
} from '~/constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '~/constants/text'
import { findTypeById } from '~/helpers/inbox'
import { useEmitter } from '~/hooks'

/**
 * TODO: refactor + this component should be named sth likes InboxItem
 */
export type CardProps = {
  options: Record<string, any>
}

const Card: React.FC<CardProps> = (props) => {
  const { options: data } = props
  const navigation = useNavigation()
  const inboxType = findTypeById(data.type)
  const [inboxItem, setInboxItem] = React.useState(data)

  const onPress = () =>
    navigation.navigate('InboxItem', { inboxItemId: inboxItem.id })

  useEmitter('PUBLIC_PROFILE_LOADED', async (event) => {
    if (event.profileId.indexOf(inboxItem?.item?.sentBy?.did) >= 0) {
      // FIXME: this is a hack at the moment to force the item update itself when the required public profile is loaded
      const response = await inboxItem.fetchMe?.()
      setInboxItem(response)
    }
  })

  return (
    <TouchableOpacity
      style={[style.card, !inboxItem.read ? style.unread : {}]}
      onPress={onPress}>
      <ShimmerPlaceholder
        visible={!inboxItem.isProfileLoading}
        style={style.logo}>
        <Image source={inboxItem.avatar} style={style.logo} />
      </ShimmerPlaceholder>

      <View style={style.details}>
        <View style={style.tile}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={style.title}>{inboxItem.title} </Text>
            </View>
          </View>
          <Text style={style.date}>{inboxItem.createdAt}</Text>
        </View>
        <View>
          {Boolean(inboxItem.from) && (
            <ShimmerPlaceholder
              visible={!inboxItem.isProfileLoading}
              style={style.from}>
              <Text style={style.from}>{inboxItem.from}</Text>
            </ShimmerPlaceholder>
          )}
        </View>
        <View style={{ ...style.tile, ...style.footer }}>
          <Text style={{ ...style.text, marginTop: 4 }}>
            {inboxType?.title}
          </Text>
          {inboxType?.svg && inboxType.svg()}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default Card

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
