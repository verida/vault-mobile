import { Body, Left, ListItem, Right, Text } from 'native-base'
import React from 'react'
import { StyleSheet } from 'react-native'

import RightArrowSvg from '../../assets/icons/data/right-arrow.svg'

export default ({ item, onPressItem, selectedWalletId }) => {
  return (
    <ListItem button onPress={() => onPressItem(item)} style={styles.listItem}>
      <Left style={styles.listItemBody}>
        {item.icon}
        <Body>
          <Text style={{ marginBottom: 3 }}>
            {item.label} {selectedWalletId === item.id && '(selected)'}
          </Text>
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
