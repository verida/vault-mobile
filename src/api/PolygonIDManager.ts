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
  FetchHandler,
  ICredentialWallet,
  IDataStorage,
  Identity,
  IdentityStorage,
  IdentityWallet,
  IIdentityWallet,
  InMemoryDataSource,
  InMemoryMerkleTreeStorage,
  InMemoryPrivateKeyStore,
  IPackageManager,
  IProofService,
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
import { Blockchain, DID, DidMethod, NetworkId } from '@iden3/js-iden3-core'
import { proving } from '@iden3/js-jwz'
import Axios from 'axios'
import ReactNativeBlobUtil from 'react-native-blob-util'

const RPC_URL = 'https://rpc-mumbai.maticvigil.com'
const CONTRACT_ADDRESS = '0x134B1BE34911E39A8397ec6289782989729807a4'

const storageCache: any = {}

export default class PolygonIDManager {
  privateKey: string

  did?: DID
  identityWallet?: IIdentityWallet
  credentialWallet?: ICredentialWallet
  proofService?: IProofService
  packageMgr?: IPackageManager
  dataStorage?: IDataStorage

  public constructor(privateKey: string) {
    this.privateKey = privateKey
  }

  public async handleQRCode(authMessage: string): Promise<any> {
    const jsonData = JSON.parse(authMessage)

    console.log('JSON DATA')
    console.log(jsonData)
    const requestType = jsonData.type

    let result: any

    // @todo: check data type
    switch (requestType) {
      case 'https://iden3-communication.io/authorization/1.0/request':
        result = await this.handleAuthRequest(jsonData)
        break
      //case
    }
    return result
  }

  private async handleFetch(jsonData: any) {
    await this.init()
    const fetchHandler = new FetchHandler(this.packageMgr)
    const res = await fetchHandler.handleCredentialOffer(userDID, msgBytes)
  }

  private async handleAuthRequest(jsonData: any) {
    await this.init()

    const authHandler = new AuthHandler(
      this.packageMgr!,
      this.proofService!,
      this.credentialWallet!
    )

    console.log(jsonData)
    const msgBytes = Buffer.from(JSON.stringify(jsonData), 'utf-8')

    const authRes = await authHandler.handleAuthorizationRequestForGenesisDID(
      this.did!,
      msgBytes
    )

    console.log(authRes)

    try {
      const response = await Axios.post(
        `${authRes.authRequest.body.callbackUrl}`,
        authRes.token
      )
      console.log('response data:')
      console.log(response.data)
    } catch (err) {
      console.log(err.response)
    }
  }

  private async init() {
    if (this.did) {
      return
    }

    this.dataStorage = this.initDataStorage()
    this.credentialWallet = await this.initCredentialWallet(this.dataStorage)

    this.identityWallet = await this.initIdentityWallet(
      this.dataStorage,
      this.credentialWallet
    )

    const { did } = await this.identityWallet.createIdentity(
      'https://mywallet.com', // this is url that will be a part of auth bjj credential identifier
      {
        method: DidMethod.PolygonId,
        blockchain: Blockchain.Polygon,
        networkId: NetworkId.Mumbai,
        seed: new Uint8Array(Buffer.from(this.privateKey, 'utf-8')),
        rhsUrl: 'https://rhs-staging.polygonid.me/', // url to check revocation status of auth bjj credential, if it's not set hostUrl is used.
      }
    )

    this.did = did

    const circuitStorage = new CircuitStorage(
      new InMemoryDataSource<CircuitData>()
    )

    const conf = defaultEthConnectionConfig
    conf.url = RPC_URL
    conf.contractAddress = CONTRACT_ADDRESS
    const ethStorage = new EthStateStorage(conf)
    console.log(conf)

    const proofService = new ProofService(
      this.identityWallet,
      this.credentialWallet,
      circuitStorage,
      ethStorage
    )

    const now = new Date().getTime()
    console.log('getting verification key')
    const verificationKey = await this.fetchPolygonFile(
      `${CircuitId.AuthV2.toString()}/verification_key.json`
    )
    console.log('getting circuit')
    const provingKey = await this.fetchPolygonFile(
      `${CircuitId.AuthV2.toString()}/circuit_final.zkey`
    )
    console.log('getting wasm')
    const wasm = await this.fetchPolygonFile(
      `${CircuitId.AuthV2.toString()}/circuit.wasm`
    )
    console.log('fetched!')
    const later = new Date().getTime()
    console.log(later - now)

    const authV2Data = {
      circuitId: CircuitId.AuthV2,
      wasm,
      provingKey,
      verificationKey,
    }

    this.packageMgr = await this.getPackageMgr(
      authV2Data,
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    )
  }

  private initDataStorage(): IDataStorage {
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

  private initCredentialWallet(dataStorage: IDataStorage): CredentialWallet {
    return new CredentialWallet(dataStorage)
  }

  private initIdentityWallet(
    dataStorage: IDataStorage,
    credentialWallet: ICredentialWallet
  ): IIdentityWallet {
    const memoryKeyStore = new InMemoryPrivateKeyStore()
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore)
    const kms = new KMS()
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider)

    return new IdentityWallet(kms, dataStorage, credentialWallet)
  }

  private getPackageMgr(
    circuitData: CircuitData,
    prepareFn: AuthDataPrepareFunc,
    stateVerificationFn: StateVerificationFunc
  ): IPackageManager {
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

    const mgr: IPackageManager = new PackageManager()
    const packer = new ZKPPacker(provingParamMap, verificationParamMap)
    const plainPacker = new PlainPacker()
    mgr.registerPackers([packer, plainPacker])

    return mgr
  }

  private async fetchPolygonFile(url: string): Promise<Uint8Array> {
    storageCache[`${CircuitId.AuthV2.toString()}/verification_key.json`] =
      '/Users/chriswere/Library/Developer/CoreSimulator/Devices/B4348139-83FB-4A61-8C8F-0F5DCA1BE7D4/data/Containers/Data/Application/13A94A77-034C-4403-9BD4-065B322656B4/Documents/ReactNativeBlobUtil_tmp/ReactNativeBlobUtilTmp_z5kgs1cza55ya5m1xn4jr'
    storageCache[`${CircuitId.AuthV2.toString()}/circuit_final.zkey`] =
      '/Users/chriswere/Library/Developer/CoreSimulator/Devices/B4348139-83FB-4A61-8C8F-0F5DCA1BE7D4/data/Containers/Data/Application/13A94A77-034C-4403-9BD4-065B322656B4/Documents/ReactNativeBlobUtil_tmp/ReactNativeBlobUtilTmp_8m2yq4jgpa021mh3cit4d2'
    storageCache[`${CircuitId.AuthV2.toString()}/circuit.wasm`] =
      '/Users/chriswere/Library/Developer/CoreSimulator/Devices/B4348139-83FB-4A61-8C8F-0F5DCA1BE7D4/data/Containers/Data/Application/13A94A77-034C-4403-9BD4-065B322656B4/Documents/ReactNativeBlobUtil_tmp/ReactNativeBlobUtilTmp_gtvuqml2pv8yfu1tjflm7c'

    let path
    if (storageCache[url]) {
      path = storageCache[url]
      const exists = await ReactNativeBlobUtil.fs.exists(path)
      if (!exists) {
        console.log('~~~ bad cache', path)
        path = undefined
      }
    }

    if (!path) {
      url = `https://verida-static-resources.s3.amazonaws.com/polygonid/${url}`
      const res = await ReactNativeBlobUtil.config({
        // add this option that makes response data to be stored as a file,
        // this is much more performant.
        fileCache: true,
      }).fetch('GET', url)

      console.log(res.path())
      path = res.path()
    }

    // const stat = await ReactNativeBlobUtil.fs.stat(path)
    // const exists = await ReactNativeBlobUtil.fs.exists(path)
    // console.log(stat, exists)

    try {
      const fileData = await ReactNativeBlobUtil.fs.readFile(path, 'base64')
      const buffer = Buffer.from(fileData, 'base64')
      const result = new Uint8Array(buffer)
      return result
    } catch (err) {
      console.log('Error reading PolygonID file!')
      console.log(err)
      throw err
    }
  }
}
