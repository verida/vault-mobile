import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import { Body, Card, CardItem, Left, Right, Text } from 'native-base'
import React from 'react'
import { Image, StyleSheet } from 'react-native'

// import VeridaSvg from 'assets/icons/verida.svg'

export default ({ item, folder }) => {
  const navigation = useNavigation()
  const date = moment(item.insertedAt).format('DD MMM YYYY')
  const cardDetail = folder.getCardDetail(item)
  const onPress = () => navigation.navigate('DataItem', { folder, item })

  return (
    <Card style={style.cardItem}>
      <CardItem button style={{ borderRadius: 4 }} onPress={onPress}>
        <Left style={style.left}>
          {/* TODO: Revert to this after Polygon ID demo */}
          {/* {item.icon ? ( */}
          <Image
            // source={{ uri: item.icon }}
            source={{
              uri: 'https://www.gitbook.com/cdn-cgi/image/width=40,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F2089358966-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FcsJ16ZcrlkRarpduMtf3%252Ficon%252Fw82c12VFG0mG431s6uZS%252FTwitter.png%3Falt%3Dmedia%26token%3Da8f08639-fbf6-4542-b1c3-e8b4b9f03422',
            }}
            style={{ width: 40, height: 40, borderRadius: 999999 }}
          />
          {/* ) : (
            <VeridaSvg />
          )} */}
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
