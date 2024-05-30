import LottieView from 'lottie-react-native'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import ButtonStyles from '~/styles/button'
import TextStyles from '~/styles/text'

import Text from './Text'

/**
 * @deprecated use the other custom `<Button>` component instead
 */
export default function Button(props) {
  const style = props.style || {}
  let textStyle = props.textStyle || {}
  let hasButtonBackground = true
  const type =
    (props.color && ButtonStyles[props.color]) || ButtonStyles.primary
  const textColor = (() => {
    switch (props.color) {
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
    <View
      style={
        props.color !== 'transparent-link' ? { alignItems: 'center' } : {}
      }>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {props.icon && <View style={{ marginRight: 5 }}>{props.icon}</View>}
        {typeof props.children === 'string' ? (
          <Text style={{ ...TextStyles[textColor], ...textStyle }}>
            {props.children}
          </Text>
        ) : (
          props.children
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
        props.disabled &&
          !props.color?.includes('transparent') &&
          ButtonStyles.disabled,
      ]}
      hitSlop={
        hasButtonBackground && !props.color?.includes('transparent')
          ? {}
          : { top: 10, left: 10, right: 10, bottom: 10 }
      }
      onPress={props.loading ? null : props.onPress}
      disabled={props.disabled}>
      {!props.loading ? (
        buttonContent
      ) : (
        <LottieView
          source={require('~/assets/animations/loading-small-light.json')}
          loop={true}
          autoPlay={true}
        />
      )}
    </TouchableOpacity>
  )
}
