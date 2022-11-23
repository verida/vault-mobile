import PINCode from '@haskkor/react-native-pincode'
import * as SecureStore from 'expo-secure-store'
import React from 'react'
import { connect } from 'react-redux'

import { FIRST_TIME_LOGIN_KEY } from 'constants/storage'
import { useAuth } from 'hooks/useAuth'
import { setAuthStatus as setAuthStatusAction } from 'reduxStore/general/actions'

import { BLACK_ORIGIN_COLOR } from '../../constants/color'

function CreatePin(props) {
  const { setAuthStatus } = props
  const { refresh } = useAuth()

  async function onFinish() {
    setAuthStatus(true)
    await SecureStore.setItemAsync(FIRST_TIME_LOGIN_KEY, 'true')
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

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch) => {
  return {
    setAuthStatus: (status) => dispatch(setAuthStatusAction(status)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePin)
