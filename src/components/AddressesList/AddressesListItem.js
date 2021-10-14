import React from 'react'
import { StyleSheet } from 'react-native'
import { ListItem, Body, Text, Right, Left } from 'native-base'
import RightArrowSvg from '../../assets/icons/data/right-arrow.svg'
import AddressSvg from '../../assets/icons/address.svg'

export default ({ item }) => {
  return (
    <ListItem
      button
      onPress={item.onPress}
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 0,
          marginLeft: 0,
          paddingLeft: 16,
        },
      ]}>
      <Left style={{ flex: 2 }}>
        <AddressSvg />
        <Body>
          <Text style={{ marginBottom: 3, marginTop: 3 }}>{item.name}</Text>
          <Text note>{`${item.address}`}</Text>
        </Body>
      </Left>
      <Right>
        <RightArrowSvg />
      </Right>
    </ListItem>
  )
}

const style = StyleSheet.create({})
