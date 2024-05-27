import { Body, Left, ListItem, Right, Text } from 'native-base'
import React from 'react'
import { StyleSheet } from 'react-native'

import AddressSvg from '~/assets/icons/address.svg'
import RightArrowSvg from '~/assets/icons/data/right-arrow.svg'

export default ({ item }) => {
  return (
    <ListItem button onPress={item.onPress} style={styles.item}>
      <Left style={styles.itemWrapper}>
        <AddressSvg />
        <Body>
          <Text style={styles.label}>{item.name}</Text>
          <Text note>{`${item.address}`}</Text>
        </Body>
      </Left>
      <Right>
        <RightArrowSvg />
      </Right>
    </ListItem>
  )
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginLeft: 0,
    paddingLeft: 16,
  },
  label: { marginBottom: 3, marginTop: 3 },
  itemWrapper: { flex: 2 },
})
