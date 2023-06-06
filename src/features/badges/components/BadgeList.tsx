import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { FlatList } from 'react-native'

import { MainStackParams } from 'navigation/types'

import { VeridaBadge } from '../@types'
import { BadgeItem } from './BadgeItem'

type BadgeListProps = {
  badges: VeridaBadge[]
}

export const BadgeList: React.FC<BadgeListProps> = ({ badges }) => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const handleClaimPress = (badge: VeridaBadge) =>
    navigation.navigate('ClaimBadge', {
      badge,
    })

  return (
    <FlatList
      data={badges}
      renderItem={({ item }) => {
        return <BadgeItem badge={item} onPressClaim={handleClaimPress} />
      }}
      keyExtractor={(item) => item.id}
    />
  )
}
