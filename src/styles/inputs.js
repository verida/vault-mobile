import { StyleSheet } from 'react-native'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

import { LIGHTGREY_COLOR, WHITE_COLOR } from '../constants/color'

const input = {
  fontFamily: NUNITO_SANS_SEMIBOLD,
  fontWeight: '600',
  fontSize: 14,
  alignItems: 'center',
  textAlign: 'left',

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
