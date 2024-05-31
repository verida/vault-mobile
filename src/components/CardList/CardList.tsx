import React from 'react'
import { View } from 'react-native'

import Card from './Card'

export type CardListProps = {
  list: Record<string, any>[]
}

export const CardList: React.FC<CardListProps> = (props) => {
  const { list } = props
  const cards = list.map((options) => (
    <Card options={options} key={`inbox - ${options.id}`} />
  ))

  return <View>{cards}</View>
}
