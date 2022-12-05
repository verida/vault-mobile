import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { FlatList } from 'react-native'

import BadgeItem from './BadgeItem'
import { MainStackParams } from 'navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type ConnectionList = {
  connection: string
  icon: any
  id: string
  username: string
  status: boolean,
}

type BadgeListProps = {
  data: ConnectionList[]
}


const BadgeList: React.FC<BadgeListProps> = ({ data }) => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const onPress = () => navigation.navigate('BadgeClaiming')

  const renderItem = ({ item }: { item: ConnectionList }) => {
    return <BadgeItem buttonLabel='Claim' item={item} onPress={onPress} />
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  )
}

export default BadgeList
