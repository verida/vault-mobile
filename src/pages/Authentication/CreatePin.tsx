import PINCode from '@haskkor/react-native-pincode'
import { setBioAuthStatus } from 'features/auth'
import React from 'react'

import { useAuth } from 'hooks/useAuth'
import { useAppDispatch } from 'reduxStore/types'

import { BLACK_ORIGIN_COLOR } from '../../constants/color'

export const CreatePin: React.FC = () => {
  const { refresh } = useAuth()
  const dispatch = useAppDispatch()

  async function onFinish() {
    dispatch(setBioAuthStatus(true))
    await refresh()
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
