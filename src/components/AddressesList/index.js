import React from 'react'
import { SwipeListView } from 'react-native-swipe-list-view'
import { Text, View } from 'react-native'

import AddressesListItem from './AddressesListItem'

export default ({ list }) => {
  return (
    <SwipeListView
      data={list}
      renderItem={(data) => (
        <View>
          <AddressesListItem item={data.item} />
        </View>
      )}
      renderHiddenItem={(data) => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            flex: 1,
          }}>
          <View
            style={{
              width: 80,
              backgroundColor: '#007AFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Edit</Text>
          </View>
          <View
            style={{
              width: 80,
              backgroundColor: '#FF3B30',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Remove</Text>
          </View>
        </View>
      )}
      rightOpenValue={-160}
    />
  )
}
