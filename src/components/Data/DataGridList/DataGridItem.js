import React from 'react'
import { StyleSheet } from 'react-native'
import { Body, Card, CardItem, Left, Right, Text } from 'native-base'
import moment from 'moment'
import StravaSvg from '../../../assets/icons/strava.svg'
import { useNavigation } from '@react-navigation/native'

export default ({ item, folder }) => {
  const navigation = useNavigation()
  const date = moment(item.createdAt).format('DD MMM YYYY')
  const cardDetail = folder.getCardDetail(item)
  const onPress = () => navigation.navigate('DataItem', { folder, item })

  return (
    <Card style={style.cardItem}>
      <CardItem button style={{ borderRadius: 4 }} onPress={() => onPress}>
        <Left style={style.left}>
          <StravaSvg />
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
