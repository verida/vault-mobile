import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { MainStackScreenProps } from 'navigation/types'

import { BLACK_ORIGIN_COLOR } from '../../constants/color'

export type ChangePinScreenParams = undefined

type ChangePinScreenProps = MainStackScreenProps<'ChangePin'>

export const ChangePinScreen: React.FC<ChangePinScreenProps> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    })
  }, [navigation])

  const [loading, setLoading] = useState(true)
  const [pinCodeStatus, setPinCodeStatus] = useState(true)
  const [isPinCorrect, setPinCorrectStatus] = useState(false)

  useEffect(() => {
    const init = async () => {
      const status = await hasUserSetPinCode()
      setPinCodeStatus(status)
      setLoading(false)
    }

    init()
  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading </Text>
        <ActivityIndicator size='large' />
      </View>
    )
  }

  if (pinCodeStatus && !isPinCorrect) {
    return (
      <PINCode
        status={'enter'}
        titleEnter={'Enter your previous PIN'}
        onClickButtonLockedPage={() => BackHandler.exitApp()}
        finishProcess={() => setPinCorrectStatus(true)}
        colorCircleButtons='#dfe1e8'
        stylePinCodeColorTitle={BLACK_ORIGIN_COLOR}
        stylePinCodeColorSubtitle={BLACK_ORIGIN_COLOR}
        stylePinCodeButtonNumber={BLACK_ORIGIN_COLOR}
        stylePinCodeDeleteButtonSize={45}
        stylePinCodeCircle={{ height: 10, width: 10, borderRadius: 5 }}
      />
    )
  }

  return (
    <PINCode
      status={'choose'}
      titleChoose={'Enter a New PIN Code'}
      titleConfirm={'Confirm your New PIN Code'}
      finishProcess={() => navigation.goBack()}
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
})
