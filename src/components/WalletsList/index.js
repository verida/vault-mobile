import React from 'react'
import { SwipeListView } from 'react-native-swipe-list-view'
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native'

import WalletsListItem from './WalletsListItem'

export default ({ list }) => {
  const createTwoButtonAlert = () =>
    Alert.alert('Are you sure you want to delete wallet / address?', null, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => console.log('OK Pressed'),
        style: 'destructive',
      },
    ])

  return (
    <SwipeListView
      data={list}
      style={styles.listView}
      renderItem={(data) => (
        <View
          style={[
            styles.listItemWrapper,
            data.item.other && styles.otherListItem,
          ]}>
          <WalletsListItem item={data.item} />
        </View>
      )}
      renderHiddenItem={(data) => (
        <TouchableOpacity
          style={[
            styles.removeButton,
            data.item.other && styles.removeButtonOther,
          ]}
          onPress={createTwoButtonAlert}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      )}
      rightOpenValue={-80}
    />
  )
}

const styles = StyleSheet.create({
  listView: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(60, 60, 67, 0.1)',
  },
  listItemWrapper: {
    borderTopColor: 'rgba(60, 60, 67, 0.1)',
  },
  otherListItem: {
    marginTop: 30,
    borderTopWidth: 0.5,
  },
  removeButton: {
    width: 80,
    backgroundColor: 'red',
    alignSelf: 'flex-end',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonOther: {
    marginTop: 30.5,
  },
  removeButtonText: { color: '#fff', textAlign: 'center' },
})
