import React from 'react'
import { SwipeListView } from 'react-native-swipe-list-view'
import { Text, View } from 'react-native'

import WalletsListItem from './WalletsListItem'

export default ({ list }) => {
  return (
    <SwipeListView
      data={list}
      renderItem={(data) => (
        <View style={{ marginTop: data.item.other ? 30 : 0 }}>
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
            marginTop: data.item.other ? 30 : 0,
          }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Remove</Text>
        </View>
      )}
      rightOpenValue={-80}
    />
  )
}
