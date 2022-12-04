import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { FlatList } from 'react-native'

import BadgeItem from './BadgeItem'
import { MainStackParams } from 'navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const vdaImg = require('assets/badges_icon/verida_identity.png')

export type ConnectionList = {
  connection: string
  status: string
  icon: any
  id: string
}

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    connection: 'Verida Identity',
    status: '@cmcWebCode',
    icon: vdaImg,
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb2',
    connection: 'Twitter Account',
    status: '@cmcWebCode',
    icon: vdaImg,
  },
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb',
    connection: 'Discord Account',
    status: '@cmcWebCode',
    icon: vdaImg,
  },
]

const BadgeList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const onPress = () => navigation.navigate('BadgeClaiming')
  const renderItem = ({ item }: { item: ConnectionList }) => {
    return <BadgeItem buttonLabel='Claim' item={item} onPress={onPress} />
  }

  return (
    <>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </>
  )
}

export default BadgeList
