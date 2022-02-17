import React from 'react'
import { View } from 'react-native'

import Card from './Card'

export default ({ list }) => {
  const cards = list.map((options) => (
    <Card options={options} key={`inbox - ${options.id}`} />
  ))

  return <View>{cards}</View>
}
