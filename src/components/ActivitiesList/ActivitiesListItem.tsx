import { Body, Card, CardItem, Left, Right, Text } from 'native-base'
import React from 'react'
import { StyleSheet } from 'react-native'

export type ActivitiesListItemProps = {
  item: Record<string, any>
}

export const ActivitiesListItem: React.FC<ActivitiesListItemProps> = (
  props
) => {
  const { item } = props
  return (
    <Card style={style.cardItem}>
      <CardItem button onPress={item.onPress} style={{ borderRadius: 4 }}>
        <Left style={{ flex: 2 }}>
          {item.icon}
          <Body>
            <Text>{item.label}</Text>
            <Text note>
              {item.distance.value} {item.distance.unitOfMeasure},{' '}
              {item.calories} cal
            </Text>
          </Body>
        </Left>
        <Right>
          <Text style={{ opacity: 0.6 }}>{item.date}</Text>
        </Right>
      </CardItem>
    </Card>
  )
}

const style = StyleSheet.create({
  cardItem: {
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 4,
  },
})
