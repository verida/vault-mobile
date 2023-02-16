import { useTheme } from 'contexts/ThemeContext'
import React, { Ref, useCallback, useRef, useState } from 'react'
import {
  StyleSheet,
  TextInput as OriginalTextInput,
  TextStyle,
  View,
} from 'react-native'

import AnimatedCheckbox from 'components/Checkbox/AnimatedCheckbox'
import { Label } from 'components/Typography/Label'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import inputs from 'styles/inputs'
import { Theme } from 'styles/types'

export enum FormInputType {
  Text,
  Email,
  Password,
  url,
}

export type FormInputProps = React.ComponentPropsWithRef<
  typeof OriginalTextInput
> & {
  label?: string
  errorMessage?: string
  type?: FormInputType
  disabled?: boolean
  inputStyle?: TextStyle
  withAnimatedChecbox?: boolean
  checked?: boolean
  loading?: boolean
}

export const FormInput = React.forwardRef(
  (props: FormInputProps, receivedRef: Ref<OriginalTextInput>) => {
    const {
      label,
      placeholder,
      errorMessage,
      style,
      inputStyle,
      testID,
      disabled,
      onFocus: onInputFocus,
      onBlur: onInputBlur,
      withAnimatedChecbox,
      loading,
      checked,
      ...rest
    } = props
    const { theme } = useTheme()
    const styles = useThemeAwareStyle(createStyles)
    const [focused, setFocused] = useState(false)
    const fallbackRef = useRef(null)
    const ref = receivedRef || fallbackRef
    const onFocus = useCallback(
      (e) => {
        setFocused(true)
        onInputFocus && onInputFocus(e)
      },
      [onInputFocus]
    )
    const onBlur = useCallback(
      (e) => {
        setFocused(false)
        onInputBlur && onInputBlur(e)
      },
      [onInputBlur]
    )

    return (
      <View style={style}>
        {label && (
          <Label
            testID={`${testID}.label`}
            style={[
              styles.label,
              errorMessage
                ? {
                    color: theme.color.error,
                  }
                : {},
              disabled
                ? {
                    color: theme.color.textGrey500,
                  }
                : {},
            ]}>
            {label}
          </Label>
        )}
        <View
          testID={`${testID}.inputContainer`}
          pointerEvents={disabled ? 'none' : 'auto'}>
          <OriginalTextInput
            {...rest}
            testID={testID}
            placeholder={placeholder}
            ref={ref}
            editable={!disabled}
            underlineColorAndroid={theme.color.transparent}
            style={[
              styles.textInput,
              inputStyle,
              focused
                ? { borderColor: theme.color.veridaGreen }
                : errorMessage
                ? {
                    borderColor: theme.color.error,
                  }
                : {},
              disabled
                ? {
                    color: theme.color.textGrey100,
                    backgroundColor: theme.color.veryLightGrey,
                  }
                : {},
            ]}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholderTextColor={theme.color.placeholderTextColor}
          />
          {withAnimatedChecbox && !focused && (
            <View
              style={{
                position: 'absolute',
                right: 4,
                width: 32,
                height: '100%',
                alignItems: 'center',
              }}>
              <AnimatedCheckbox
                checked={!loading && checked}
                failed={!loading && !checked}
                showLoading={loading}
                highlightColor={theme.color.success}
                checkmarkColor={theme.color.onSuccess}
                boxOutlineColor={theme.color.grey500}
              />
            </View>
          )}
        </View>
        <Label
          testID={`${testID}.errorMessage`}
          style={[
            errorMessage
              ? {
                  ...styles.errorMessage,
                  color: theme.color.error,
                }
              : styles.errorMessageEmpty,
          ]}>
          {errorMessage}
        </Label>
      </View>
    )
  }
)

FormInput.defaultProps = {
  type: FormInputType.Text,
  withAnimatedChecbox: false,
  checked: false,
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    textInput: {
      ...inputs.input,
      textAlign: 'left',
    },
    errorMessageEmpty: {
      height: 0,
    },
    errorMessage: {
      marginTop: theme.spacing.xs,
    },
    label: {
      marginBottom: 2,
      padding: 0,
      margin: 0,
      lineHeight: 18,
    },
  })
