import React from 'react'
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'

export type DataCardListItemProps = {
  // TODO: Add stronger typing
  item: any
}

export const DataCardListItem: React.FunctionComponent<
  DataCardListItemProps
> = (props) => {
  const { item } = props

  return (
    <TouchableWithoutFeedback onPress={item.onPress}>
      <View style={[style.cardItem, { backgroundColor: item.color }]}>
        <View>{item.icon}</View>
        <Text style={{ paddingTop: 10, color: '#fff' }}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

const style = StyleSheet.create({
  cardItem: {
    margin: 15,
    padding: 16,
    width: 150,
    height: 112,
    borderRadius: 12,
  },
})
