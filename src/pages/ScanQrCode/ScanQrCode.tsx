import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import { isEmpty } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import parse from 'url-parse'

import { useDeeplink } from 'hooks/useDeeplink'
import { useWalletConnect } from 'hooks/useWalletConnect'
import { MainStackParams } from 'navigation/types'
import CameraOverlay from 'pages/ScanQrCode/CameraOverlay'
import { canBeHandledByDeeplink, isSupportedDomain } from 'utils/linking'

const WAIT_TIME = 3000

function ScanQrCode(
  props: NativeStackScreenProps<MainStackParams, 'ScanQrCode'>
) {
  const { navigation, route } = props
  const [enabled, setEnabled] = useState(true)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const handleDeeplink = useDeeplink(navigation as any)
  const { requestConnect } = useWalletConnect()

  useEffect(() => {
    setEnabled(true)
  }, [navigation])

  const toggleFlash = useCallback(() => {
    setIsFlashOn((prevState) => !prevState)
  }, [])

  const onClose = useCallback(async () => {
    navigation.goBack()
  }, [navigation])

  const handleQrCode = async (data: string) => {
    if (!enabled) {
      return
    }
    setEnabled(false)
    setTimeout(() => {
      setEnabled(true)
    }, WAIT_TIME)
    if (route.params.onReadQRCode) {
      route.params.onReadQRCode(data)
      navigation.goBack()
    } else {
      // Wallet Connect
      if (data.startsWith('wc:') && data.indexOf('bridge') >= 0) {
        navigation.goBack()
        requestConnect(data)
        return
      }

      // Check if content is a valid URL
      const { hostname, pathname } = parse(data, true)
      if (isEmpty(hostname)) {
        Alert.alert('Error', 'This domain is not supported')
        return
      }
      // Try to open the URL in browser if it is not a deeplink
      if (!canBeHandledByDeeplink(pathname) || !isSupportedDomain(hostname)) {
        try {
          const canOpen = await Linking.canOpenURL(data)
          if (canOpen) {
            await Linking.openURL(data)
          }
        } catch (error) {
          Sentry.captureException(error)
        }
        return
      }
      handleDeeplink(data)
    }
  }

  const onBarCodeRead = async (event: BarCodeReadEvent) => {
    const { data } = event
    await handleQrCode(data)
  }

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
        onBarCodeRead={Platform.OS === 'ios' ? onBarCodeRead : undefined}
        onGoogleVisionBarcodesDetected={({ barcodes }) => {
          if (isEmpty(barcodes) || isEmpty(barcodes[0].data)) {
            return
          }
          handleQrCode(barcodes[0].data)
        }}
        googleVisionBarcodeType={
          RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE
        }
      />
      <CameraOverlay
        isFlashOn={isFlashOn}
        onToggleFlash={toggleFlash}
        onClose={onClose}
        firstTime={route.params.firstTime}
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
