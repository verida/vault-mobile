import { StyleSheet } from 'react-native'

import {
  LIGHTGREY_COLOR,
  PRIMARY_COLOR,
  PRIMARY_COLOR_200,
  PRIMARY_COLOR_300,
  WHITE_COLOR,
} from '/constants/color'
import { NUNITO_SANS_BOLD } from '/constants/text'

const transparent = {
  backgroundColor: 'transparent',
  borderColor: 'transparent',
}
export default StyleSheet.create({
  button: {
    borderRadius: 4,
    fontSize: 16,
    marginBottom: 16, // FIXME: There shall not have a margin on a container of an atomic component! The parent of the component should handle the spacing
    borderWidth: 1,
    height: 48, // FIXME: There should not have a fixed height for such component, It should have a fontSize, a lineHeight and paddings!
    justifyContent: 'center',
    fontFamily: NUNITO_SANS_BOLD,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: WHITE_COLOR,
  },
  'light-primary': {
    backgroundColor: PRIMARY_COLOR_200,
    color: PRIMARY_COLOR_300,
    borderWidth: 0,
  },
  primary: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  secondary: {
    backgroundColor: WHITE_COLOR,
    borderColor: LIGHTGREY_COLOR,
    borderWidth: 1,
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
  },
})
