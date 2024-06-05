import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { PRIMARY_COLOR } from '~/constants/color'

const LoadingIndicator = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={PRIMARY_COLOR} size='large' />
    </View>
  )
}

export default LoadingIndicator

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
