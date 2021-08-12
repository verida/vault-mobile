import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import { BLACK_ORIGIN_COLOR } from '../../constants/color'

function CreatePin(props) {
  const { navigation } = props
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const status = await hasUserSetPinCode()
      if (status) {
        navigation.navigate('Success')
        return
      }
      setLoading(false)
    }

    init()
  }, [navigation])

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading </Text>
        <ActivityIndicator size='large' />
      </View>
    )
  }

  function onFinish() {
    props.navigation.navigate('Success')
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
})

export default CreatePin
