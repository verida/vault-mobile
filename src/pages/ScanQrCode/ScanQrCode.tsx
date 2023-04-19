import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import { usePolygonId } from 'features/polygonid'
import { isEmpty } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import parse from 'url-parse'

import { useDeeplink } from 'hooks/useDeeplink'
import { useWalletConnect, useWalletConnectv2 } from 'hooks/useWalletConnect'
import { MainStackParams } from 'navigation/types'
import CameraOverlay from 'pages/ScanQrCode/CameraOverlay'
import { canBeHandledByDeeplink, isSupportedDomain } from 'utils/linking'

const WAIT_TIME = 3000

// TODO: To remove after testing
// Temporary data for testing purposes
const mockRequests = {
  connectionRequest:
    '{"id":"f94a0e87-2561-4b48-85e1-ae26af699bfb","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/authorization/1.0/request","thid":"f94a0e87-2561-4b48-85e1-ae26af699bfb","body":{"callbackUrl":"https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=505280","reason":"test flow","scope":[]},"from":"did:polygonid:polygon:mumbai:2qH7XAwYQzCp9VfhpNgeLtK2iCehDDrfMWUCEg5ig5"}',
  credentialOffer:
    '{"id":"d20e7cf4-911a-4163-8374-82003eda7e04","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/credentials/1.0/offer","thid":"d20e7cf4-911a-4163-8374-82003eda7e04","body":{"url":"https://self-hosted-platform.polygonid.me/v1/agent","credentials":[{"id":"a5ee6ae7-cd4b-11ed-8e4f-0242c0a88005","description":"KYCAgeCredential"}]},"from":"did:polygonid:polygon:mumbai:2qH7XAwYQzCp9VfhpNgeLtK2iCehDDrfMWUCEg5ig5","to":"did:polygonid:polygon:mumbai:2qHtz8rrerMMAFEcQSRu6Mvajxx7vkNLptw7LSS6C4"}',
  proofRequest:
    '{"id":"807cb8ea-5feb-4c4f-81d0-d756707d5024","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/authorization/1.0/request","thid":"807cb8ea-5feb-4c4f-81d0-d756707d5024","body":{"callbackUrl":"https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=62378","reason":"test flow","scope":[{"id":1,"circuitId":"credentialAtomicQuerySigV2","query":{"allowedIssuers":["*"],"context":"https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld","credentialSubject":{"birthday":{"$lt":20000101}},"skipClaimRevocationCheck":true,"type":"KYCAgeCredential"}}]},"from":"did:polygonid:polygon:mumbai:2qH7XAwYQzCp9VfhpNgeLtK2iCehDDrfMWUCEg5ig5"}',
}
const testPolygonId = false
const mockRequestToTest = mockRequests.proofRequest

function ScanQrCode(
  props: NativeStackScreenProps<MainStackParams, 'ScanQrCode'>
) {
  const { navigation, route } = props
  const [enabled, setEnabled] = useState(true)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const handleDeeplink = useDeeplink(navigation as any)
  const { requestConnect: handleWalletConnectV1Data } = useWalletConnect()
  const { requestConnect: handleWalletConnectV2Data } = useWalletConnectv2()
  const { handleQRCodeMessage: handlePolygonIdData } = usePolygonId()

  useEffect(() => {
    setEnabled(true)
  }, [navigation])

  const toggleFlash = useCallback(() => {
    setIsFlashOn((prevState) => !prevState)
  }, [])

  const onClose = useCallback(async () => {
    navigation.goBack()
  }, [navigation])

  // TODO: To remove after testing
  if (testPolygonId) {
    navigation.goBack()
    handlePolygonIdData(mockRequestToTest)
    return null
  }

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
      return
    }

    // WalletConnect v1
    // Ex: wc:9145e975-4af0-4a28-a569-19aab7a21dd8@1?bridge=https%3A%2F%2F6.bridge.walletconnect.org&key=40dbb09f0eac060885a0edaf7f1ab7efba207c9b339bc49f805d61b615ac28a7
    if (data.startsWith('wc:') && data.indexOf('bridge') >= 0) {
      navigation.goBack()
      handleWalletConnectV1Data(data)
      return
    }

    // WalletConnect v2
    // Ex: 'wc:c034ac9bf61c23d3e551663ed8bf973c260130c12f89f22a35a5d1032e3c47af@2?relay-protocol=iridium&symKey=05f034367d195bca2532385b620bd2b2a6c5c62101050bdfe9253e283fe50e12'
    if (data.startsWith('wc:') && data.indexOf('relay-protocol') >= 0) {
      navigation.goBack()
      handleWalletConnectV2Data(data)
      return
    }

    // PolygonId
    // Ex: `{"id":"c8fb4f92-3d5d-4634-b292-1d39a001f4dd","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/authorization/1.0/request%22,%22thid%22:%22c8fb4f92-3d5d-4634-b292-1d39a001f4dd%22,%22body%22:%7B%22callbackUrl%22:%22https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=858469%22,%22reason%22:%22test flow","scope":[]},"from":"did:polygonid:polygon:mumbai:2qDyy1kEo2AYcP3RT4XGea7BtxsY285szg6yP9SPrs"}`
    if (data.match('did:polygonid:polygon')) {
      navigation.goBack()
      handlePolygonIdData(data)
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
