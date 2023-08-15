import { useClipboard } from '@react-native-community/clipboard'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import {
  canBeHandledByDeeplink,
  isSupportedDomain,
  useDeeplink,
} from 'features/deepLinks'
import { useProtocols } from 'features/protocols'
import { isEmpty } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import parse from 'url-parse'

import { MainStackParams } from 'navigation/types'
import CameraOverlay from 'pages/ScanQrCode/CameraOverlay'

const WAIT_TIME = 3000

function ScanQrCode(
  props: NativeStackScreenProps<MainStackParams, 'ScanQrCode'>
) {
  const { navigation, route } = props
  const [enabled, setEnabled] = useState(true)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const { processQrCode: processQrCodeByProtocolHandlers } = useProtocols()
  const handleDeeplink = useDeeplink(navigation as any)

  useEffect(() => {
    setEnabled(true)
  }, [navigation])

  const toggleFlash = useCallback(() => {
    setIsFlashOn((prevState) => !prevState)
  }, [])

  const onClose = useCallback(async () => {
    navigation.goBack()
  }, [navigation])

  const handleQrCode = useCallback(
    async (data: string) => {
      if (!enabled) {
        return
      }

      setEnabled(false)

      setTimeout(() => {
        // TODO: This is causing a state update on an unmounted component, use a debounce/throttle on handleQrCode instead
        setEnabled(true)
      }, WAIT_TIME)

      if (route.params.onReadQRCode) {
        route.params.onReadQRCode(data)
        navigation.goBack()
        return
      }

      const handledByProtocols = processQrCodeByProtocolHandlers(data)
      if (handledByProtocols) {
        // It's assumed the protocol handlers manage the navigation but i would be better to TODO: Find a way to not have the handler manager closing the QR Code scanner.
        return
      }

      // TODO: Progressively move the protocols into the protocol handlers

      const { hostname, pathname } = parse(data, true)

      // Check if supported URL
      if (
        !isEmpty(hostname) &&
        isSupportedDomain(hostname) &&
        canBeHandledByDeeplink(pathname)
      ) {
        // TODO: Move Verida Connect to protocol handlers
        handleDeeplink(data)
        return
      }

      // Check if can be opened by device
      try {
        if (await Linking.canOpenURL(data)) {
          // TODO: Do we really want to continue opening any data non-supported by the Verida Wallet?
          await Linking.openURL(data)
          return
        }
      } catch (error) {
        Sentry.captureException(error)
      }

      Alert.alert('Error', 'QR Code not supported')
    },
    [
      enabled,
      processQrCodeByProtocolHandlers,
      handleDeeplink,
      navigation,
      route.params,
    ]
  )

  const onBarCodeRead = async (event: BarCodeReadEvent) => {
    const { data } = event
    await handleQrCode(data)
  }

  // HACK: In development mode, we'll also read the content of the clipboard
  //       for a connection string.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [maybeClipboardContent] = __DEV__ ? useClipboard() : []

  React.useEffect(() => {
    ;(async () => {
      if (!maybeClipboardContent) return

      return handleQrCode(maybeClipboardContent)
    })()
  }, [maybeClipboardContent, handleQrCode])

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
