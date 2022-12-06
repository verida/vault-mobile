import LottieView from 'lottie-react-native'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

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
      case 'light-primary':
        return 'light-primary'
      default:
        return 'white'
    }
  })()

  const buttonContent = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      {props.icon && (
        <View
          style={{
            marginRight: 5,
          }}>
          {props.icon}
        </View>
      )}
      <Text style={{ ...TextStyles[textColor] }}>{props.children}</Text>
    </View>
  )

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
