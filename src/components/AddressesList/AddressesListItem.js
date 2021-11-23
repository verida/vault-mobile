import React from 'react'
import { StyleSheet } from 'react-native'
import { ListItem, Body, Text, Right, Left } from 'native-base'
import RightArrowSvg from '../../assets/icons/data/right-arrow.svg'
import AddressSvg from '../../assets/icons/address.svg'

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
