import Color from 'color'
import { useTheme } from 'contexts/ThemeContext'
import React, {
  ForwardedRef,
  RefObject,
  useCallback,
  useRef,
  useState,
} from 'react'
import {
  StyleSheet,
  TextInput as OriginalTextInput,
  TextStyle,
  View,
} from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'

import { Icon } from 'components/Icon'
import { Label } from 'components/Typography/Label'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import inputs from 'styles/inputs'
import { Theme } from 'styles/types'

import { AnimatedCheckbox } from './AnimatedCheckbox'

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
  errorMessage?: string | undefined
  type?: FormInputType
  disabled?: boolean
  inputStyle?: TextStyle
  withAnimatedChecbox?: boolean
  checkboxEmptyState?: boolean
  checked?: boolean
  loading?: boolean
  suffix?: string
  suffixStyle?: TextStyle
  desciption?: string | undefined
}

export const FormInput = React.forwardRef(
  (props: FormInputProps, receivedRef: ForwardedRef<OriginalTextInput>) => {
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
      checkboxEmptyState,
      loading,
      checked,
      desciption,
      ...rest
    } = props
    const { theme } = useTheme()
    const styles = useThemeAwareStyle(createStyles)
    const [focused, setFocused] = useState(false)
    const fallbackRef = useRef<OriginalTextInput>(null)
    const ref = (receivedRef || fallbackRef) as RefObject<OriginalTextInput>
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
          <TouchableWithoutFeedback
            onPress={() => {
              ref.current?.focus()
            }}>
            <OriginalTextInput
              {...rest}
              testID={testID}
              placeholder={placeholder}
              ref={ref}
              editable={!disabled}
              underlineColorAndroid={theme.color.transparent}
              style={[
                {
                  textAlign: 'left',
                  backgroundColor: 'red',
                  padding: 0,
                  paddingRight: 2,
                },
                {
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                },
                styles.textInput,
                inputStyle,
                errorMessage
                  ? { borderColor: theme.color.error }
                  : focused
                  ? {
                      borderColor: theme.color.veridaGreen,
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
          </TouchableWithoutFeedback>
          {withAnimatedChecbox && !checkboxEmptyState && (
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
                loading={loading}
                failedIcon={
                  <Icon name='warning' color={theme.color.error} size={20} />
                }
                successIcon={
                  <Icon name='tick' color={theme.color.success} size={20} />
                }
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
        {desciption && (
          <Label
            style={{
              marginTop: 2,
              color: Color(theme.color.onBackground).alpha(0.4).toString(),
            }}>
            {desciption}
          </Label>
        )}
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
