import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { FlatList } from 'react-native'

import { MainStackParams } from 'navigation/types'
import { BadgeType } from 'utils/types/badges'

import BadgeItem from './BadgeItem'

type BadgeListProps = {
  data: BadgeType[]
}

const BadgeList: React.FC<BadgeListProps> = ({ data }) => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const onPress = (item: BadgeType) =>
    navigation.navigate('ClaimBadge', {
      data: item,
    })

  const renderItem = ({ item }: { item: BadgeType }) => {
    return <BadgeItem item={item} onPress={onPress} />
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
