import React from 'react'
import { StyleSheet } from 'react-native'
import { ListItem, Body, Text, Right, Left } from 'native-base'
import { useNavigation } from '@react-navigation/native'

import RightArrowSvg from '../../assets/icons/data/right-arrow.svg'

export default ({ item }) => {
  const navigation = useNavigation()

  return (
    <ListItem
      button
      onPress={() => {
        if (item.other) {
          navigation.navigate('OtherAddresses')
        } else {
          navigation.navigate('SingleWallet')
        }
      }}
      style={styles.listItem}>
      <Left style={styles.listItemBody}>
        {item.icon}
        <Body>
          <Text style={{ marginBottom: 3 }}>{item.label}</Text>
          <Text note>{`${item.count} addresses`}</Text>
        </Body>
      </Left>
      <Right>
        <RightArrowSvg />
      </Right>
    </ListItem>
  )
}

const styles = StyleSheet.create({
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginLeft: 0,
    paddingLeft: 16,
  },
  listItemBody: { flex: 2 },
})
