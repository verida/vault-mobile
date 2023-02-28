import {
  AuthDataPrepareFunc,
  AuthHandler,
  BjjProvider,
  CircuitData,
  CircuitId,
  CircuitStorage,
  CredentialStorage,
  CredentialWallet,
  DataPrepareHandlerFunc,
  defaultEthConnectionConfig,
  EthConnectionConfig,
  EthStateStorage,
  FSKeyLoader,
  ICredentialWallet,
  IDataStorage,
  Iden3,
  Identity,
  IdentityStorage,
  IdentityWallet,
  IIdentityWallet,
  InMemoryDataSource,
  InMemoryMerkleTreeStorage,
  InMemoryPrivateKeyStore,
  IPackageManager,
  KMS,
  KmsKeyType,
  PackageManager,
  PlainPacker,
  Profile,
  ProofService,
  ProvingParams,
  StateVerificationFunc,
  VerificationHandlerFunc,
  VerificationParams,
  W3CCredential,
  ZKPPacker,
} from '@0xpolygonid/js-sdk'
import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core'
import { proving } from '@iden3/js-jwz'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import { isEmpty } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import parse from 'url-parse'

import { useDeeplink } from 'hooks/useDeeplink'
import { usePolygonId } from 'hooks/usePolygonId'
import { useWalletConnect, useWalletConnectv2 } from 'hooks/useWalletConnect'
import { MainStackParams } from 'navigation/types'
import CameraOverlay from 'pages/ScanQrCode/CameraOverlay'
import { canBeHandledByDeeplink, isSupportedDomain } from 'utils/linking'

const fetchPolygonFile = async (url: string): Promise<Uint8Array> => {
  url = `https://verida-static-resources.s3.amazonaws.com/polygonid/${url}`
  console.log(url)
  const res = await ReactNativeBlobUtil.config({
    // add this option that makes response data to be stored as a file,
    // this is much more performant.
    fileCache: true,
  }).fetch('GET', url)

  console.log('The file saved to ', res.path())
  console.log(res.info())

  ReactNativeBlobUtil.fs.readFile()

  const blob = await res.blob()
  console.log('reading blob')
  const data = await blob.readBlob('arraybuffer')
  console.log(data.length)
  const result = new Uint8Array(data)
  console.log(result.length)
  throw new Error('hey')
  return result
}

const WAIT_TIME = 3000

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

    const getPackageMgr = async (
      circuitData: CircuitData,
      prepareFn: AuthDataPrepareFunc,
      stateVerificationFn: StateVerificationFunc
    ): Promise<IPackageManager> => {
      const authInputsHandler = new DataPrepareHandlerFunc(prepareFn)

      const verificationFn = new VerificationHandlerFunc(stateVerificationFn)
      const mapKey =
        proving.provingMethodGroth16AuthV2Instance.methodAlg.toString()
      const verificationParamMap: Map<string, VerificationParams> = new Map([
        [
          mapKey,
          {
            key: circuitData.verificationKey,
            verificationFn,
          },
        ],
      ])

      const provingParamMap: Map<string, ProvingParams> = new Map()
      provingParamMap.set(mapKey, {
        dataPreparer: authInputsHandler,
        provingKey: circuitData.provingKey,
        wasm: circuitData.wasm,
      })

      WebAssembly.compile()

      const mgr: IPackageManager = new PackageManager()
      const packer = new ZKPPacker(provingParamMap, verificationParamMap)
      const plainPacker = new PlainPacker()
      mgr.registerPackers([packer, plainPacker])

      return mgr
    }

    async function identityCreation() {
      console.log('=============== key creation ===============')

      const dataStorage = initDataStorage()
      const credentialWallet = await initCredentialWallet(dataStorage)

      const identityWallet = await initIdentityWallet(
        dataStorage,
        credentialWallet
      )

      const { did, credential } = await identityWallet.createIdentity(
        'https://mywallet.com', // this is url that will be a part of auth bjj credential identifier
        {
          method: DidMethod.PolygonId,
          blockchain: Blockchain.Polygon,
          networkId: NetworkId.Mumbai,
          seed: new Uint8Array(Buffer.from('daveseedseedseedseedseedseeduser', 'utf-8')),
          rhsUrl: 'https://rhs-staging.polygonid.me/', // url to check revocation status of auth bjj credential, if it's not set hostUrl is used.
        }
      )

      console.log('=============== did ===============')
      console.log(did.toString())
      console.log('=============== Auth BJJ credential ===============')
      console.log(JSON.stringify(credential))

      const circuitStorage = new CircuitStorage(
        new InMemoryDataSource<CircuitData>()
      )

      /*await circuitStorage.saveCircuitData(CircuitId.AuthV2, {
        circuitId: CircuitId.AtomicQuerySigV2,
        wasm: await fetchPolygonFile(
          `${CircuitId.AuthV2.toString()}/circuit.wasm`
        ),
        provingKey: await fetchPolygonFile(
          `${CircuitId.AuthV2.toString()}/circuit_final.zkey`
        ),
        verificationKey: await fetchPolygonFile(
          `${CircuitId.AuthV2.toString()}/verification_key.json`
        ),
      })*/

      /*
      await circuitStorage.saveCircuitData(CircuitId.AtomicQuerySigV2, {
        circuitId: CircuitId.AtomicQuerySigV2,
        wasm: await fetchPolygonFile(
          `${CircuitId.AtomicQuerySigV2.toString()}/circuit.wasm`
        ),
        provingKey: await fetchPolygonFile(
          `${CircuitId.AtomicQuerySigV2.toString()}/circuit_final.zkey`
        ),
        verificationKey: await fetchPolygonFile(
          `${CircuitId.AtomicQuerySigV2.toString()}/verification_key.json`
        ),
      })

      await circuitStorage.saveCircuitData(CircuitId.StateTransition, {
        circuitId: CircuitId.StateTransition,
        wasm: await fetchPolygonFile(
          `${CircuitId.StateTransition.toString()}/circuit.wasm`
        ),
        provingKey: await fetchPolygonFile(
          `${CircuitId.StateTransition.toString()}/circuit_final.zkey`
        ),
        verificationKey: await fetchPolygonFile(
          `${CircuitId.StateTransition.toString()}/verification_key.json`
        ),
      })

      await circuitStorage.saveCircuitData(CircuitId.AtomicQueryMTPV2, {
        circuitId: CircuitId.AtomicQueryMTPV2,
        wasm: await fetchPolygonFile(
          `${CircuitId.AtomicQueryMTPV2.toString()}/circuit.wasm`
        ),
        provingKey: await fetchPolygonFile(
          `${CircuitId.AtomicQueryMTPV2.toString()}/circuit_final.zkey`
        ),
        verificationKey: await fetchPolygonFile(
          `${CircuitId.AtomicQueryMTPV2.toString()}/verification_key.json`
        ),
      })*/

      const conf = defaultEthConnectionConfig;
      //conf.url = infuraUrl;
      conf.url = 'https://rpc-mumbai.maticvigil.com'
      conf.contractAddress = '0x134B1BE34911E39A8397ec6289782989729807a4'
      const ethStorage = new EthStateStorage(conf)
      console.log(conf)

      const proofService = new ProofService(
        identityWallet,
        credentialWallet,
        circuitStorage,
        ethStorage
      )

      console.log('a')
      //const authV2Data = await circuitStorage.loadCircuitData(CircuitId.AuthV2)
      const authV2Data = {
        circuitId: CircuitId.AtomicQuerySigV2,
        wasm: await fetchPolygonFile(
          `${CircuitId.AuthV2.toString()}/circuit.wasm`
        ),
        provingKey: await fetchPolygonFile(
          `${CircuitId.AuthV2.toString()}/circuit_final.zkey`
        ),
        verificationKey: await fetchPolygonFile(
          `${CircuitId.AuthV2.toString()}/verification_key.json`
        ),
      }
      console.log('b')

      try {
        const packageMgr = await getPackageMgr(
          authV2Data,
          proofService.generateAuthV2Inputs.bind(proofService),
          proofService.verifyState.bind(proofService)
        )
        console.log('c')
        const authHandler = new AuthHandler(
          packageMgr,
          proofService,
          credentialWallet
        )
        console.log('d')

        const jsonData = {"id":"e2ce9582-82e9-4016-978d-31fe481ee0e9","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/authorization/1.0/request","thid":"e2ce9582-82e9-4016-978d-31fe481ee0e9","body":{"callbackUrl":"https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=274044","reason":"test flow","scope":[]},"from":"did:polygonid:polygon:mumbai:2qDyy1kEo2AYcP3RT4XGea7BtxsY285szg6yP9SPrs"}
        console.log(jsonData)
        const msgBytes = Buffer.from(JSON.stringify(jsonData), 'utf-8')

        const authRes =
          await authHandler.handleAuthorizationRequestForGenesisDID(
            did,
            msgBytes
          )

        console.log(authRes)
      } catch (err) {
        console.log(err)
      }

      /*const circuitStorage = new CircuitStorage(
        new InMemoryDataSource<CircuitData>()
      )

      const proofService = new ProofService(
        identityWallet,
        credentialWallet,
        circuitStorage,
        mockStateStorage
      )
      const packageMgr = await getPackageMgr(
        await circuitStorage.loadCircuitData(CircuitId.AuthV2),
        proofService.generateAuthV2Inputs.bind(proofService),
        proofService.verifyState.bind(proofService)
      )
      authHandler = new AuthHandler(packageMgr, proofService, credWallet)
      const msgBytes = byteEncoder.encode(JSON.stringify(authReq))
      const authRes = await authHandler.handleAuthorizationRequestForGenesisDID(
        userDID,
        msgBytes
      )*/
    }

    function initDataStorage(): IDataStorage {
      console.log(defaultEthConnectionConfig)
      const conf: EthConnectionConfig = defaultEthConnectionConfig
      conf.contractAddress = '0x134B1BE34911E39A8397ec6289782989729807a4'
      conf.url = 'https://rpc-mumbai.maticvigil.com'

      const dataStorage = {
        credential: new CredentialStorage(
          new InMemoryDataSource<W3CCredential>()
        ),
        identity: new IdentityStorage(
          new InMemoryDataSource<Identity>(),
          new InMemoryDataSource<Profile>()
        ),
        mt: new InMemoryMerkleTreeStorage(40),
        states: new EthStateStorage(conf),
      }
      return dataStorage
    }

    async function initCredentialWallet(
      dataStorage: IDataStorage
    ): Promise<CredentialWallet> {
      return new CredentialWallet(dataStorage)
    }

    async function initIdentityWallet(
      dataStorage: IDataStorage,
      credentialWallet: ICredentialWallet
    ): Promise<IIdentityWallet> {
      const memoryKeyStore = new InMemoryPrivateKeyStore()
      const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore)
      const kms = new KMS()
      kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider)

      return new IdentityWallet(kms, dataStorage, credentialWallet)
    }

    identityCreation()

    // fake polygon id scan
    //const polygonIdData = `{"id":"c8fb4f92-3d5d-4634-b292-1d39a001f4dd","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/authorization/1.0/request%22,%22thid%22:%22c8fb4f92-3d5d-4634-b292-1d39a001f4dd%22,%22body%22:%7B%22callbackUrl%22:%22https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=858469%22,%22reason%22:%22test flow","scope":[]},"from":"did:polygonid:polygon:mumbai:2qDyy1kEo2AYcP3RT4XGea7BtxsY285szg6yP9SPrs"}`
    //handleQrCode(polygonIdData)
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
        console.log('data------')
        console.log(data)
        requestPolygonId(data)
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
