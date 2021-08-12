import React from 'react'
import { StyleSheet } from 'react-native'
import { Body, Card, CardItem, Text } from 'native-base'

export default ({ item }) => {
  return (
    <Card transparent style={style.card}>
      <CardItem>
        <Body>
          <Text note>{item.field}:</Text>
          <Text style={style.value}>{item.value}</Text>
        </Body>
      </CardItem>
    </Card>
  )
}

const style = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  value: {
    fontSize: 14,
    marginTop: 5,
  },
})
