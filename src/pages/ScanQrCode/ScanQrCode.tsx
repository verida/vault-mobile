import { useClipboard } from '@react-native-community/clipboard'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import { isPolygonIdQrCodeMessage, usePolygonId } from 'features/polygonid'
import {
  isWalletConnectConnection,
  useWalletConnectContext,
} from 'features/walletConnect'
import { isEmpty } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import parse from 'url-parse'

import { useDeeplink } from 'hooks/useDeeplink'
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

  const { onRequestConnect } = useWalletConnectContext()
  const { handleQRCodeMessage: handlePolygonIdData } = usePolygonId()

  // HACK: In development mode, we'll also read the content of the clipboard
  //       for a connection string.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [maybeClipboardContent] = __DEV__ ? useClipboard() : []

  useEffect(() => {
    setEnabled(true)
  }, [navigation])

  const toggleFlash = useCallback(
    () => setIsFlashOn((prevState) => !prevState),
    []
  )

  const onClose = useCallback(
    async () => void navigation.goBack(),
    [navigation]
  )

  const handleQrCode = React.useCallback(
    async (data: string) => {
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
        return
      }

      if (isWalletConnectConnection(data))
        return Promise.all([onRequestConnect(data), navigation.goBack()])

      // Polygon ID
      if (isPolygonIdQrCodeMessage(data)) {
        navigation.goBack()
        handlePolygonIdData(data)
        return
      }

      // Check if content is a valid URL
      const { hostname, pathname } = parse(data, true)
      if (isEmpty(hostname)) {
        Alert.alert('Error', 'QR Code not supported')
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
    },
    [
      enabled,
      handleDeeplink,
      handlePolygonIdData,
      navigation,
      onRequestConnect,
      route.params,
    ]
  )

  const onBarCodeRead = React.useCallback(
    ({ data }: BarCodeReadEvent) => handleQrCode(data),
    [handleQrCode]
  )

  React.useEffect(
    () =>
      void (async () => {
        if (!maybeClipboardContent) return

        return handleQrCode(maybeClipboardContent)
      })(),
    [maybeClipboardContent, handleQrCode]
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
