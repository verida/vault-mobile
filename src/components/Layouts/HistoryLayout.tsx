import React from 'react'
import { Dimensions, StyleSheet, View, ViewProps } from 'react-native'

import { HistoryView } from '~/components/History'
import { SegmentData } from '~/components/SegmentControl'

export interface HistoryLayoutProps extends ViewProps {
  route: SegmentData
}

const HistoryLayout: React.FC<HistoryLayoutProps> = (props) => (
  <View style={style.scene}>
    <HistoryView {...props} />
  </View>
)

export default HistoryLayout

const style = StyleSheet.create({
  scene: {
    flex: 1,
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
})
