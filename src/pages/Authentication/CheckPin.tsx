import PINCode, { IProps as PinCodeProps } from '@haskkor/react-native-pincode'
import React from 'react'
import { BackHandler } from 'react-native'

import { BLACK_ORIGIN_COLOR } from '~/constants/color'

interface Props extends Partial<PinCodeProps> {
  title?: string
  subtitle?: string
}

export const CheckPin: React.FC<Props> = (props) => {
  return (
    <PINCode
      status={'enter'}
      titleEnter={props.title || 'Please enter your PIN'}
      subtitleEnter={props.subtitle || 'to confirm the action'}
      onClickButtonLockedPage={() => BackHandler.exitApp()}
      finishProcess={props.finishProcess}
      colorCircleButtons='#dfe1e8'
      stylePinCodeColorTitle={BLACK_ORIGIN_COLOR}
      stylePinCodeColorSubtitle={BLACK_ORIGIN_COLOR}
      stylePinCodeButtonNumber={BLACK_ORIGIN_COLOR}
      stylePinCodeDeleteButtonSize={45}
      stylePinCodeCircle={{ height: 10, width: 10, borderRadius: 5 }}
    />
  )
}
