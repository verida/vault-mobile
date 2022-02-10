import React from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'

import History from '../History'

export default (props) => (
  <View style={style.scene}>
    <History {...props} />
  </View>
)

const style = StyleSheet.create({
  scene: {
    flex: 1,
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
})
