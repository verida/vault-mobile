import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { FlatList } from 'react-native'
import { BadgeData, ClaimableBadgeParams } from 'types/badges'

import { MainStackParams } from 'navigation/types'

import BadgeItem from './BadgeItem'

type BadgeListProps = {
  data: BadgeData[]
}

const BadgeList: React.FC<BadgeListProps> = ({ data }) => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const onPress = (item: ClaimableBadgeParams) =>
    navigation.navigate('ClaimBadge', {
      data: item,
    })

  const renderItem = ({ item }: { item: BadgeData }) => {
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
