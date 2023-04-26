import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import { Body, Card, CardItem, Left, Right, Text } from 'native-base'
import React from 'react'
import { Image, StyleSheet } from 'react-native'

// TODO: Find a better fallback icon for records
import VeridaSvg from 'assets/icons/verida.svg'

export default ({ item, folder }) => {
  const navigation = useNavigation()
  const date = moment(item.insertedAt).format('DD MMM YYYY')
  const cardDetail = folder.getCardDetail(item)
  const onPress = () => navigation.navigate('DataItem', { folder, item })

  return (
    <Card style={style.cardItem}>
      <CardItem button style={{ borderRadius: 4 }} onPress={onPress}>
        <Left style={style.left}>
          {item.icon ? (
            <Image
              source={{ uri: item.icon }}
              style={{ width: 40, height: 40, borderRadius: 999999 }}
            />
          ) : (
            <VeridaSvg />
          )}
          <Body style={{ marginLeft: 15 }}>
            <Text>{cardDetail.name}</Text>
            <Text note style={style.subText}>
              {cardDetail.summary}
            </Text>
          </Body>
        </Left>
        <Right style={style.right}>
          <Text note style={style.date}>
            {date}
          </Text>
        </Right>
      </CardItem>
    </Card>
  )
}

const style = StyleSheet.create({
  cardItem: {
    width: '100%',
    borderRadius: 4,
  },
  left: {
    flex: 1,
    marginRight: 10,
  },
  subText: {
    fontSize: 14,
    marginTop: 5,
  },
  date: {
    fontSize: 12,
  },
  right: {
    height: '100%',
    flex: -1,
  },
})
