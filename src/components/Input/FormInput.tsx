import { useTheme } from 'contexts/ThemeContext'
import React, { Ref, useCallback, useRef, useState } from 'react'
import {
  StyleSheet,
  TextInput as OriginalTextInput,
  TextStyle,
  View,
} from 'react-native'

import AnimatedCheckbox from 'components/Checkbox/AnimatedCheckbox'
import AnimatedDots from 'components/Checkbox/AnimatedDots'
import { Caption } from 'components/Typography/Caption'

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
  onInputFocus?: () => void
  onInputBlur?: () => void
  disabled?: boolean
  inputStyle?: TextStyle
  withAnimatedChecbox?: boolean
  checked?: boolean

  // placeholder?: string
  // inputHeight?: number
  // testID?: string
  // mode?: 'flat' | 'outlined'
  // disabled?: boolean
  // value?: string
  // onInputFocus?: () => void
  // onInputBlur?: () => void
  // selectionColor?: string
  // underlineColor?: string
  // padding?: 'none' | 'normal'
  // multiline?: boolean
  // numberOfLines?: number
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
      onInputFocus,
      onInputBlur,
      withAnimatedChecbox,
      checked,
      ...rest
    } = props
    const { theme } = useTheme()
    const [focused, setFocused] = useState(false)
    const fallbackRef = useRef(null)
    const ref = receivedRef || fallbackRef
    const onFocus = useCallback(() => {
      setFocused(true)
      onInputFocus && onInputFocus()
    }, [onInputFocus])
    const onBlur = useCallback(() => {
      setFocused(false)
      onInputBlur && onInputBlur()
    }, [onInputBlur])

    return (
      <View
        style={[
          styles.container,
          focused ? styles.containerFocused : {},
          style,
        ]}>
        {label && (
          <Caption
            testID={`${testID}.label`}
            style={[
              styles.label,
              focused
                ? { color: theme.color.primary }
                : {
                    ...styles.errorMessage,
                    color: theme.color.error,
                  }
                ? { color: theme.color.onBackground }
                : {},
            ]}>
            {label}
          </Caption>
        )}
        <View
          testID={`${testID}.inputContainer`}
          style={[
            styles.textInputOutline,
            {
              borderColor: theme.color.gray900,
              backgroundColor: theme.color.gray100,
              shadowColor: theme.color.onSurface,
            },
            focused ? { borderColor: theme.color.primary } : {},
            errorMessage ? { borderColor: theme.color.error } : {},
          ]}
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
              { color: theme.color.onSurface },
              inputStyle,
            ]}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholderTextColor={theme.color.gray900}
          />
          {withAnimatedChecbox && (
            <View
              style={{
                position: 'absolute',
                right: 4,
                width: 32,
                height: '100%',
                alignItems: 'center',
              }}>
              <AnimatedCheckbox
                checked={checked}
                showLoading={!checked}
                highlightColor={theme.color.success}
                checkmarkColor={theme.color.onSuccess}
                boxOutlineColor={theme.color.gray200}
              />
            </View>
          )}
        </View>
        <Caption
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
        </Caption>
      </View>
    )
  }
)

FormInput.defaultProps = {
  type: FormInputType.Text,
  withAnimatedChecbox: false,
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
  },
  containerFocused: {
    minHeight: 48,
  },
  textInput: {
    height: 48,
    minHeight: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'normal',
  },
  textInputOutline: {
    borderWidth: 1,
    borderRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  errorMessageEmpty: {
    height: 0,
  },
  errorMessage: {
    fontSize: 12,
    lineHeight: 16,
    height: 16,
  },
  label: {
    marginBottom: 8,
    padding: 0,
    margin: 0,
    fontSize: 16,
    lineHeight: 16,
  },
})
