import React, { PropsWithChildren } from 'react'
import { StyleSheet, Text } from 'react-native'

import { BLACK_COLOR_OPACITY } from '~/constants/color'
import { NUNITO_SANS_SEMIBOLD } from '~/constants/text'

export interface LabelProps extends PropsWithChildren<unknown> {
  style?: any
}
/**
 * @deprecated use <Typography> instead
 */
const Label: React.FC<LabelProps> = (props) => {
  return <Text style={[style.label, props.style]}>{props.children}</Text>
}
export default Label

export const DEFAULT_LABEL_COLOR = BLACK_COLOR_OPACITY(0.8)

const style = StyleSheet.create({
  label: {
    marginTop: 16,
    marginBottom: 4,
    fontSize: 12,
    color: DEFAULT_LABEL_COLOR,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
})
