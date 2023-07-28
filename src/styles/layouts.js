import { Dimensions, StyleSheet } from 'react-native'

import { SNOW_COLOR } from '../constants/color'

export const LAYOUT_BASE = {
  backgroundColor: SNOW_COLOR,
  paddingHorizontal: 20,
  minHeight: Dimensions.get('window').height,
}

export default StyleSheet.create({
  layout: {
    ...LAYOUT_BASE,
    paddingVertical: 23,
  },
})
