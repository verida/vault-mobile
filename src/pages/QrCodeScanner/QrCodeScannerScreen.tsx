import { useClipboard } from '@react-native-community/clipboard'
import { config } from 'config'
import {
  canBeHandledByDeeplink,
  isSupportedDomain,
  useDeeplink,
} from 'features/deepLinks'
import { useProtocols } from 'features/protocols'
import { Logger } from 'features/telemetry'
import { isEmpty } from 'lodash'
import React, { useCallback, useState } from 'react'
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import parse from 'url-parse'
import { useDebouncedCallback } from 'use-debounce'

import { MainStackScreenProps } from 'navigation/types'
import { QrCodeScannerOverlay } from 'pages/QrCodeScanner/QrCodeScannerOverlay'

const logger = new Logger('Pages/QrCodeScanner/QrCodeScannerScreen')

const WAIT_TIME = 3000

export type QrCodeScannerScreenParams = {
  firstTime: boolean
  onReadQRCode?: (data: string) => void
}

type QrCodeScannerScreenProps = MainStackScreenProps<'ScanQrCode'>

export const QrCodeScannerScreen: React.FunctionComponent<QrCodeScannerScreenProps> =
  (props) => {
    const { navigation, route } = props

    const [processing, setProcessing] = useState(false)
    const [isFlashOn, setIsFlashOn] = useState(false)
    const { processQrCode: processQrCodeByProtocolHandlers } = useProtocols()
    const handleDeeplink = useDeeplink()

    const handleToggleFlash = useCallback(() => {
      setIsFlashOn((prevState) => !prevState)
    }, [])

    const handleClose = useCallback(async () => {
      navigation.goBack()
    }, [navigation])

    const processQrCodeMessage = useCallback(
      async (data: string) => {
        setProcessing(true)

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
          logger.error(error)
        }

        setProcessing(false)
        Alert.alert('Error', 'QR Code not supported')
      },
      [
        processQrCodeByProtocolHandlers,
        handleDeeplink,
        navigation,
        route.params,
      ]
    )

    const debouncedProcessQrCodeMessage = useDebouncedCallback(
      processQrCodeMessage,
      WAIT_TIME,
      {
        leading: true,
      }
    )

    const handleQrCodeRead = async (event: BarCodeReadEvent) => {
      const { data } = event
      await debouncedProcessQrCodeMessage(data)
    }

    // HACK: In development mode, we'll also read the content of the clipboard
    //       for a connection string.
    const [maybeClipboardContent] =
      // eslint-disable-next-line react-hooks/rules-of-hooks
      __DEV__ && config.dev.enableClipboardInQrCodeScanner ? useClipboard() : []

    React.useEffect(() => {
      ;(async () => {
        if (!maybeClipboardContent) return

        return debouncedProcessQrCodeMessage(maybeClipboardContent)
      })()
    }, [maybeClipboardContent, debouncedProcessQrCodeMessage])

    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.camera}
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
          onBarCodeRead={Platform.OS === 'ios' ? handleQrCodeRead : undefined}
          onGoogleVisionBarcodesDetected={({ barcodes }) => {
            if (isEmpty(barcodes) || isEmpty(barcodes[0].data)) {
              return
            }
            debouncedProcessQrCodeMessage(barcodes[0].data)
          }}
          googleVisionBarcodeType={
            RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE
          }
        />
        <QrCodeScannerOverlay
          processing={processing}
          isFlashOn={isFlashOn}
          onToggleFlash={handleToggleFlash}
          onClose={handleClose}
          firstTime={route.params.firstTime}
        />
      </View>
    )
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
})
