import React, { useCallback, useState } from 'react'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { StyleSheet, View } from 'react-native'
import { AuthStackParams } from 'navigation/types'
import CameraOverlay from 'pages/ScanQrCode/CameraOverlay'
import { useAuth } from 'hooks/useAuth'
import { openUrl } from 'utils/linking'

function ScanQrCode(
  _props: NativeStackScreenProps<AuthStackParams, 'ScanQrCode'>
) {
  const [isFlashOn, setIsFlashOn] = useState(false)
  const { initialize, authenticated } = useAuth()

  const toggleFlash = useCallback(() => {
    setIsFlashOn((prevState) => !prevState)
  }, [])

  const onClose = useCallback(async () => {
    if (!authenticated) {
      await initialize()
    }
  }, [initialize, authenticated])

  const onBarCodeRead = useCallback(
    async (event: BarCodeReadEvent) => {
      if (!authenticated) {
        await initialize()
      }
      const { data } = event
      await openUrl(data)
    },
    [initialize, authenticated]
  )

  return (
    <View style={styles.container}>
      <RNCamera
        type={RNCamera.Constants.Type.back}
        flashMode={
          isFlashOn
            ? RNCamera.Constants.FlashMode.torch
            : RNCamera.Constants.FlashMode.off
        }
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        androidRecordAudioPermissionOptions={{
          title: 'Permission to use audio recording',
          message: 'We need your permission to use your audio',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        style={styles.camera}
        onBarCodeRead={onBarCodeRead}
      />
      <CameraOverlay
        isFlashOn={isFlashOn}
        onToggleFlash={toggleFlash}
        onClose={onClose}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
})

export default ScanQrCode
