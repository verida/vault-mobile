import React, { Ref, useRef } from 'react'
import {
  StyleSheet,
  TextInput as OriginalTextInput,
  TextInputProps,
} from 'react-native'

import { useTheme } from '~/contexts/ThemeContext'
import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import inputs from '~/styles/inputs'
import { Theme } from '~/styles/types'

type InputProps = TextInputProps

const TextInput = React.forwardRef(
  (props: InputProps, receivedRef: Ref<OriginalTextInput>) => {
    const { style, ...rest } = props
    const { theme } = useTheme()
    const fallbackRef = useRef(null)
    const ref = receivedRef || fallbackRef
    const styles = useThemeAwareStyle(createStyles)
    return (
      <OriginalTextInput
        ref={ref}
        style={[styles.input, style]}
        underlineColorAndroid={theme.color.transparent}
        placeholderTextColor={theme.color.textGrey600}
        {...rest}
      />
    )
  }
)

export default TextInput

const createStyles = (_: Theme) =>
  StyleSheet.create({
    input: {
      ...inputs.input,
      textAlign: 'left',
      minHeight: 36,
    },
  })
