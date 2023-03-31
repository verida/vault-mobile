import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import { isEmpty } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native'
import parse from 'url-parse'
import { BarCodeScanner } from 'expo-barcode-scanner';

import { DownloadProgressEvent, PolygonIDManager } from 'api/PolygonIDManager'
import { useDeeplink } from 'hooks/useDeeplink'
import { usePolygonId } from 'hooks/usePolygonId'
import { useWalletConnect, useWalletConnectv2 } from 'hooks/useWalletConnect'
import { MainStackParams } from 'navigation/types'
import CameraOverlay from 'pages/ScanQrCode/CameraOverlay'
import { canBeHandledByDeeplink, isSupportedDomain } from 'utils/linking'

const WAIT_TIME = 3000
const REQUEST_ID = 0

function ScanQrCode(
  props: NativeStackScreenProps<MainStackParams, 'ScanQrCode'>
) {
  const { navigation, route } = props
  const [enabled, setEnabled] = useState(true)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const handleDeeplink = useDeeplink(navigation as any)
  const { requestConnect } = useWalletConnect()
  const { requestConnect: requestConnectv2 } = useWalletConnectv2()
  //const { requestConnect: requestPolygonId } = usePolygonId()

  useEffect(() => {
    setEnabled(true)

    //fakePolygon()
  }, [navigation])

  // Temporary method to fake polygon requests for testing purposes
  const fakePolygon = async (request?: string) => {
    // fake PolygonID scan
    // auth request

    if (!request) {
      request =
        '{"id":"cc7b28e7-9f80-474e-879c-2c3db8d29b5a","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/authorization/1.0/request","thid":"cc7b28e7-9f80-474e-879c-2c3db8d29b5a","body":{"callbackUrl":"https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=198059","reason":"test flow","scope":[{"id":1,"circuitId":"credentialAtomicQuerySigV2","query":{"allowedIssuers":["*"],"context":"https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld","credentialSubject":{"birthday":{"$lt":20000101}},"type":"KYCAgeCredential"}}]},"from":"did:polygonid:polygon:mumbai:2qH7XAwYQzCp9VfhpNgeLtK2iCehDDrfMWUCEg5ig5"}'
    }

    const polygonIdSeed = 'daveseedseedseedseedseedseeduser'
    const pm = new PolygonIDManager(polygonIdSeed)

    // bind events
    pm.on('initializing', (starting: boolean) => {
      console.log(starting ? 'initializing' : 'initialization complete')
    })

    pm.on('downloading', (progress: DownloadProgressEvent) => {
      console.log(`download progress; ${progress.count} / ${progress.total}`)
    })

    const qrData = pm.decodeQRCode(request)

    // @todo: check data type
    switch (qrData.type) {
      // Request (this may be a request to connect or a request to submit a ZKP)
      case 'https://iden3-communication.io/authorization/1.0/request':
        if (qrData.body.scope && qrData.body.scope.length) {
          // We have a scope object implying we need to submit a ZKP
          console.log(
            `Do you want to submit a ZKP to ${qrData.hostname} (${qrData.from}) with the following data?`,
            JSON.stringify(qrData.body.scope)
          )
          console.log(
            '@todo: display screen asking user to click "share" to submit ZK proof'
          )
        } else {
          // We have a generic connection request
          console.log(
            `Do you want to connect to ${qrData.hostname} (${qrData.from})?`
          )
          console.log('@todo: display screen asking user to click "connect"')
        }

        // assume user has clicked "share" or "connect"
        try {
          // returns void if no issues
          await pm.handleAuthRequest(qrData)
        } catch (err: any) {
          // all issues will be returned as an error
          console.log('display error to user: ', err.message)
        }
        break
      // Offer to save a new ZK credential
      case 'https://iden3-communication.io/credentials/1.0/offer':
        console.log(
          `Do you want to accept a ZK credential from ${qrData.hostname} (${qrData.from}) with the following credential data?`,
          JSON.stringify(qrData.body.credentials)
        )
        console.log(
          '@todo: display screen asking user to click "save" to store ZK credential'
        )
        try {
          // returns void if no issues
          await pm.handleFetch(qrData)
        } catch (err: any) {
          // all issues will be returned as an error
          console.log('display error to user: ', err.message)
        }
        break
    }
  }

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
      // WalletConnect v1
      // Ex: wc:9145e975-4af0-4a28-a569-19aab7a21dd8@1?bridge=https%3A%2F%2F6.bridge.walletconnect.org&key=40dbb09f0eac060885a0edaf7f1ab7efba207c9b339bc49f805d61b615ac28a7
      if (data.startsWith('wc:') && data.indexOf('bridge') >= 0) {
        navigation.goBack()
        requestConnect(data)
        return
      }
      // WC v2
      // Ex: 'wc:c034ac9bf61c23d3e551663ed8bf973c260130c12f89f22a35a5d1032e3c47af@2?relay-protocol=iridium&symKey=05f034367d195bca2532385b620bd2b2a6c5c62101050bdfe9253e283fe50e12'
      if (data.startsWith('wc:') && data.indexOf('relay-protocol') >= 0) {
        navigation.goBack()
        requestConnectv2(data)
        return
      }
      // PolygonId
      // Ex: `{"id":"c8fb4f92-3d5d-4634-b292-1d39a001f4dd","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/authorization/1.0/request%22,%22thid%22:%22c8fb4f92-3d5d-4634-b292-1d39a001f4dd%22,%22body%22:%7B%22callbackUrl%22:%22https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=858469%22,%22reason%22:%22test flow","scope":[]},"from":"did:polygonid:polygon:mumbai:2qDyy1kEo2AYcP3RT4XGea7BtxsY285szg6yP9SPrs"}`
      if (data.match('did:polygonid:polygon')) {
        navigation.goBack()
        console.log('POLYGON ID Request')
        fakePolygon(data)
        //console.log('data------')
        //console.log(data)
        //requestPolygonId(data)
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

  const handleBarCodeScanned = async ({ type, data }: any) => {
    await handleQrCode(data)
  };

  return (
    <View style={styles.container}>
      {/* TODO: Refactor */}
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {/* <RNCamera
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
      /> */}
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
