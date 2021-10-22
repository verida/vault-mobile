import React from 'react'
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { SUCCESS_COLOR } from 'constants/color'
import { DefaultAvatar } from 'api/utils'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

export type AccountItemProps = Omit<ViewProps, 'children'> & {
  name: string
  did: string
  avatar?: ImageSourcePropType
  selected: boolean
  onSelect: (did: string) => void
}

function AccountItem(props: AccountItemProps) {
  const { name, did, selected, avatar, onSelect } = props

  function onPress() {
    onSelect(did)
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image style={styles.avatar} source={avatar || DefaultAvatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.did}>{did}</Text>
      </View>
      {selected && (
        <AntDesign name='checkcircle' size={20} color={SUCCESS_COLOR} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
    marginHorizontal: 16,
  },
  name: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 16,
  },
  did: {
    color: '#041133',
    opacity: 0.6,
    fontSize: 14,
  },
})

export default AccountItem
