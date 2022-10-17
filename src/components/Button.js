import LottieView from 'lottie-react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'

import ButtonStyles from '../styles/button'
import TextStyles from '../styles/text'
import Text from './Text'

export default (props) => {
  const styles = props.style || {}
  const type =
    (props.color && ButtonStyles[props.color]) || ButtonStyles.primary
  const textColor = (() => {
    switch (props.color) {
      case 'secondary':
      case 'transparent':
      case 'transparent-border':
      case 'grey':
        return 'primary'
      case 'transparent-grey':
        return 'grey'
      case 'warning':
        return 'warning'
      case 'transparent-warning':
        return 'warning'
      default:
        return 'white'
    }
  })()

  return (
    <TouchableOpacity
      style={[
        ButtonStyles.button,
        styles,
        type,
        props.disabled && ButtonStyles.disabled,
      ]}
      onPress={props.onPress}
      disabled={props.disabled}>
      {!props.loading ? (
        <Text style={{ ...TextStyles[textColor] }}>{props.children}</Text>
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
