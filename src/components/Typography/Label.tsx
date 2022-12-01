import React from 'react'
import {
  StyleProp,
  StyleSheet,
  Text as NativeText,
  TextStyle,
} from 'react-native'

import Text from 'components/Text'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

type LabelProps = React.ComponentProps<typeof NativeText> & {
  style?: StyleProp<TextStyle>
}

export const Label = (props: LabelProps) => {
  const styles = useThemeAwareStyle(createStyles)
  return <Text {...props} style={[styles.text, props.style]} />
}

const createStyles = (theme: Theme) => {
  const styles = StyleSheet.create({
    text: {
      fontFamily: NUNITO_SANS_SEMIBOLD,
      fontWeight: '600',
      color: theme.color.black800,
      fontSize: theme.fontSize.s,
      lineHeight: 18,
      textAlign: 'left',
    },
  })
  return styles
}
