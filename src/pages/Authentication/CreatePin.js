import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { BLACK_ORIGIN_COLOR } from '../../constants/color'
import LottieView from 'lottie-react-native'
import PINCode from '@haskkor/react-native-pincode'

function CreatePin(props) {
  const { navigation } = props

  function onFinish() {
    navigation.navigate('Success')
  }

  return (
    <PINCode
      status={'choose'}
      finishProcess={onFinish}
      colorCircleButtons='#dfe1e8'
      stylePinCodeColorTitle={BLACK_ORIGIN_COLOR}
      stylePinCodeColorSubtitle={BLACK_ORIGIN_COLOR}
      stylePinCodeButtonNumber={BLACK_ORIGIN_COLOR}
      stylePinCodeDeleteButtonSize={45}
      stylePinCodeCircle={{ height: 10, width: 10, borderRadius: 5 }}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingView: {
    width: 150,
    height: 150,
    marginTop: 20,
  },
})

export default CreatePin
