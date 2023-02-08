import LottieView from 'lottie-react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'

import ButtonStyles from '../styles/button'
import TextStyles from '../styles/text'
import Text from './Text'

export default (props) => {
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
        <Text style={{ ...TextStyles[textColor], ...textStyle }}>
          {props.children}
        </Text>
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
