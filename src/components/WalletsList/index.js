import React from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

import { SEPARATOR_LIGHT, WHITE_COLOR } from 'constants/color'

import WalletsListItem from './WalletsListItem'

export default ({ list }) => {
  const createTwoButtonAlert = () =>
    Alert.alert('Are you sure you want to delete wallet / address?', null, [
      {
        text: 'Cancel',
        onPress: () => ({}),
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => ({}),
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
    borderTopColor: SEPARATOR_LIGHT,
  },
  listItemWrapper: {
    borderTopColor: SEPARATOR_LIGHT,
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
  removeButtonText: { color: WHITE_COLOR, textAlign: 'center' },
})
