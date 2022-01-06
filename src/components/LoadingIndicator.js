import React from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'

import { PRIMARY_COLOR } from 'constants/color'

export default () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={PRIMARY_COLOR} size='large' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
