import React from 'react'
import { SwipeListView } from 'react-native-swipe-list-view'
import { Text, View } from 'react-native'

import WalletsListItem from './WalletsListItem'

export default ({ list }) => {
  return (
    <SwipeListView
      data={list}
      style={{
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(60, 60, 67, 0.1)',
      }}
      renderItem={(data) => (
        <View
          style={{
            marginTop: data.item.other ? 30 : 0,
            borderTopWidth: data.item.other ? 0.5 : 0,
            borderTopColor: 'rgba(60, 60, 67, 0.1)',
          }}>
          <WalletsListItem item={data.item} />
        </View>
      )}
      renderHiddenItem={(data) => (
        <View
          style={{
            width: 80,
            backgroundColor: 'red',
            alignSelf: 'flex-end',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: data.item.other ? 30.5 : 0,
          }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Remove</Text>
        </View>
      )}
      rightOpenValue={-80}
    />
  )
}
