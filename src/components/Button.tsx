import LottieView from 'lottie-react-native'
import React, { type PropsWithChildren } from 'react'
import {
  GestureResponderEvent,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

import ButtonStyles from '~/styles/button'
import TextStyles from '~/styles/text'

import Text from './Text'

/**
 * @deprecated use the other custom `<Button>` component instead
 */
export interface ButtonProps extends PropsWithChildren<unknown> {
  icon?: React.ReactNode
  color: keyof typeof ButtonStyles
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: ViewStyle
  onPress: ((event: GestureResponderEvent) => void) | undefined
}

const Button: React.FC<ButtonProps> = (props) => {
  const {
    style = {},
    color,
    icon,
    children,
    disabled,
    loading,
    onPress,
  } = props

  let textStyle = props.textStyle || {}
  let hasButtonBackground = true
  const type = (color && ButtonStyles[color]) || ButtonStyles.primary
  const textColor = (() => {
    switch (color) {
      case 'secondary':
      case 'transparent-border':
      case 'grey':
        return 'primary'
      case 'transparent-white':
      case 'danger':
        return 'white'
      case 'transparent-grey':
        return 'grey'
      case 'warning':
        return 'warning'
      case 'transparent-warning':
        return 'warning'
      case 'transparent':
        return 'primary'
      case 'transparent-link':
        hasButtonBackground = false
        textStyle = { ...textStyle }
        return 'primaryColor'
      default:
        return 'white'
    }
  })()

  const buttonContent = (
    <View style={color !== 'transparent-link' ? { alignItems: 'center' } : {}}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon && <View style={{ marginRight: 5 }}>{icon}</View>}
        {typeof children === 'string' ? (
          <Text style={{ ...TextStyles[textColor], ...textStyle }}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  )

  return (
    <TouchableOpacity
      style={[
        hasButtonBackground ? ButtonStyles.button : ButtonStyles.buttonText,
        type,
        style,
        disabled && !color?.includes('transparent') && ButtonStyles.disabled,
      ]}
      hitSlop={
        hasButtonBackground && !color?.includes('transparent')
          ? {}
          : { top: 10, left: 10, right: 10, bottom: 10 }
      }
      onPress={loading ? undefined : onPress}
      disabled={disabled}>
      {!loading ? (
        buttonContent
      ) : (
        <LottieView
          source={require('assets/animations/loading-small-light.json')}
          loop={true}
          autoPlay={true}
        />
      )}
    </TouchableOpacity>
  )
}

export default Button
