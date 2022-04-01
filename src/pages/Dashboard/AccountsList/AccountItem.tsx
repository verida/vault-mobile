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
import Entypo from 'react-native-vector-icons/Entypo'
import { useSelector } from 'react-redux'

import { DefaultAvatar } from 'api/utils'
import { SNOW_COLOR, SUCCESS_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

export type AccountItemProps = Omit<ViewProps, 'children'> & {
  name: string
  did: string
  avatar?: ImageSourcePropType
  selected: boolean
  onSelect: (did: string) => void
  multipleSelect?: boolean
}

function AccountItem(props: AccountItemProps) {
  const { name, did, selected, avatar, onSelect, multipleSelect } = props
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const selectedAccount = useSelector((state) => state.selectedAccount)

  function onPress() {
    onSelect(did)
  }

  const isCurrentAccount = selectedAccount?.did === did

  function renderCheckbox() {
    if (!multipleSelect) {
      return null
    }

    return selected ? (
      <AntDesign name='checkcircle' size={20} color={SUCCESS_COLOR} />
    ) : (
      <Entypo name='circle' size={20} color={SUCCESS_COLOR} />
    )
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCurrentAccount && styles.currentAccountContainer,
      ]}
      onPress={onPress}>
      <Image style={styles.avatar} source={avatar || DefaultAvatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.did}>{did}</Text>
      </View>
      {renderCheckbox()}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  currentAccountContainer: {
    backgroundColor: SNOW_COLOR,
  },
})

export default AccountItem
