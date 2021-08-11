import { StyleSheet } from 'react-native'
import { LIGHTGREY_COLOR, WHITE_COLOR } from '../constants/color'

const input = {
  borderWidth: 1,
  borderColor: LIGHTGREY_COLOR,
  borderRadius: 4,
  paddingVertical: 9,
  paddingHorizontal: 16,
  minHeight: 48,
  backgroundColor: WHITE_COLOR,
}

export default StyleSheet.create({
  input,
  select: {
    height: 48,
    alignItems: 'flex-start',
  },
  textarea: {
    ...input,
    minHeight: 68,
  },
})
