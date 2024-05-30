import { StyleSheet, TextStyle } from 'react-native'

import {
  BLACK_COLOR,
  BLACK_COLOR_OPACITY,
  ORANGE_COLOR,
  PRIMARY_COLOR,
  WHITE_COLOR,
} from '~/constants/color'

const sharedProps: TextStyle = {
  fontFamily: 'NunitoSansBold',
  fontWeight: '500',
  fontSize: 16,
  alignItems: 'center',
  textAlign: 'center',
}

export default StyleSheet.create({
  primary: {
    color: BLACK_COLOR,
    ...sharedProps,
  },
  white: {
    color: WHITE_COLOR,
    ...sharedProps,
  },
  grey: {
    color: BLACK_COLOR,
    opacity: 0.6,
    ...sharedProps,
  },
  darkgrey: {
    color: BLACK_COLOR_OPACITY(0.8),
    ...sharedProps,
  },
  warning: {
    color: ORANGE_COLOR,
    ...sharedProps,
  },
  primaryColor: {
    color: PRIMARY_COLOR,
    ...sharedProps,
  },
})
