import { StyleSheet, TextStyle, ViewStyle } from 'react-native'

import { LIGHTGREY_COLOR, WHITE_COLOR } from '~/constants/color'
import { NUNITO_SANS_SEMIBOLD } from '~/constants/text'

const input_font: TextStyle = {
  fontFamily: NUNITO_SANS_SEMIBOLD,
  fontWeight: '600',
  fontSize: 14,
  alignItems: 'center',
  textAlign: 'left',
}

const input: ViewStyle = {
  ...input_font,

  borderWidth: 1,
  borderColor: LIGHTGREY_COLOR,
  borderRadius: 4,
  paddingVertical: 9,
  paddingHorizontal: 16,
  minHeight: 48,
  backgroundColor: WHITE_COLOR,
}

export default StyleSheet.create({
  input_font,
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
