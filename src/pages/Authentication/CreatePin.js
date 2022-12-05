import PINCode from '@haskkor/react-native-pincode'
import React from 'react'

import { BLACK_ORIGIN_COLOR } from '../../constants/color'

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

export default CreatePin
