import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-root-toast'
import { SwipeListView } from 'react-native-swipe-list-view'

import AddressesListItem from './AddressesListItem'

export default ({ list, editButtonAction, onPress }) => {
  return (
    <SwipeListView
      data={list}
      renderItem={(data) => (
        <View>
          <AddressesListItem item={data.item} onPress={onPress} />
        </View>
      )}
      renderHiddenItem={() => (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            onPress={editButtonAction}
            style={styles.editButton}>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Toast.show('________ copied / edited', {
                duration: Toast.durations.LONG,
                position: -40,
                shadow: false,
                animation: true,
                hideOnPress: true,
                delay: 0,
                backgroundColor: 'rgba(4, 17, 51, 0.8)',
              })
            }
            style={styles.removeButton}>
            <Text style={styles.actionButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
      rightOpenValue={-160}
    />
  )
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  editButton: {
    width: 80,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: { color: '#fff', textAlign: 'center' },
  removeButton: {
    width: 80,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
