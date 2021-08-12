import { StyleSheet } from 'react-native'
import { ORANGE_COLOR } from '../constants/color'

export default StyleSheet.create({
  label: {
    marginTop: 5,
    marginBottom: 7,
  },
  error: {
    borderColor: ORANGE_COLOR,
  },
  errorText: {
    color: ORANGE_COLOR,
  },
})
