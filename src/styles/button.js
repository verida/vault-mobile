import { StyleSheet } from 'react-native'

import {
  DISABLED_COLOR,
  LIGHTGREY_COLOR,
  PRIMARY_COLOR,
  WHITE_COLOR,
} from '../constants/color'
import { NUNITO_SANS_BOLD } from '../constants/text'

const transparent = {
  backgroundColor: 'transparent',
  borderColor: 'transparent',
}
export default StyleSheet.create({
  button: {
    borderRadius: 4,
    fontSize: 16,
    marginBottom: 16, // TODO: Remove it, such a generic and atomic component should never have margins, it should not handle the layout it is in, it should only care about its own internal style
    borderWidth: 1,
    height: 48, // TODO: Remove the hardcoded height, the height should be a result of the padding and font size/line height
    justifyContent: 'center',
    fontFamily: NUNITO_SANS_BOLD,
  },
  buttonText: {
    fontSize: 16,
    justifyContent: 'center',
    fontFamily: NUNITO_SANS_BOLD,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: WHITE_COLOR,
  },
  primary: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  secondary: {
    backgroundColor: WHITE_COLOR,
    borderColor: WHITE_COLOR,
  },
  warning: {
    backgroundColor: WHITE_COLOR,
    borderColor: WHITE_COLOR,
  },
  transparent: {
    ...transparent,
  },
  'transparent-grey': {
    ...transparent,
  },
  'transparent-white': {
    ...transparent,
  },
  'transparent-border': {
    ...transparent,
    borderColor: LIGHTGREY_COLOR,
  },
  'transparent-warning': {
    ...transparent,
  },
  grey: {
    borderColor: LIGHTGREY_COLOR,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: DISABLED_COLOR,
    borderColor: DISABLED_COLOR,
  },
  'transparent-link': {
    ...transparent,
  },
})

export const smallButtonHitSlop = { top: 5, right: 10, bottom: 5, left: 10 }
