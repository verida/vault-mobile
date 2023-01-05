import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { FlatList } from 'react-native'
import { BadgeType } from 'types/badges'

import { MainStackParams } from 'navigation/types'

import BadgeItem from './BadgeItem'

type BadgeListProps = {
  badges: BadgeType[]
}

const BadgeList: React.FC<BadgeListProps> = ({ badges }) => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const handleClaimPress = (badgeType: BadgeType) =>
    navigation.navigate('ClaimBadge', {
      badgeType,
    })

  return (
    <FlatList
      data={badges}
      renderItem={({ item }) => {
        return <BadgeItem badgeType={item} onPressClaim={handleClaimPress} />
      }}
      keyExtractor={(item) => item.id}
    />
  )
}

export default BadgeList
