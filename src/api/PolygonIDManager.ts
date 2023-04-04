import {
  AbstractPrivateKeyStore,
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
  IDataSource,
  IDataStorage,
  Identity,
  IdentityStorage,
  IdentityWallet,
  IIdentityWallet,
  InMemoryDataSource,
  InMemoryMerkleTreeStorage,
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
import { IDatabase } from '@verida/types'
import Axios from 'axios'
import { EventEmitter } from 'events'
import ReactNativeBlobUtil from 'react-native-blob-util'
import * as Sentry from '@sentry/react-native'

import AccountManager from './AccountManager'

const RPC_URL = 'https://rpc-mumbai.maticvigil.com'
const CONTRACT_ADDRESS = '0x134B1BE34911E39A8397ec6289782989729807a4'

const storageCache: any = {}

export interface QRCodeResult {
  id: string
  reason: string
  body: Record<string, unknown>
  from: string
  type: string
  hostname: string
  requestBytes: Buffer
}

export interface DownloadProgressEvent {
  count: number
  total: number
}

/**
 * @emits initializing
 * @emits downloading
 * @emits handleRequest
 */
export class PolygonIDManager extends EventEmitter {
  privateKey: string

  did?: DID
  identityWallet?: IIdentityWallet
  credentialWallet?: ICredentialWallet
  proofService?: IProofService
  packageMgr?: IPackageManager
  dataStorage?: IDataStorage

  public constructor(privateKey: string) {
    super()
    this.privateKey = privateKey
  }

  public decodeQRCode(authMessage: string): QRCodeResult {
    const result = JSON.parse(authMessage)
    console.log(result)

    if (result.body.callbackUrl) {
      const url = new URL(result.body.callbackUrl)
      result.hostname = url.hostname
    } else if (result.body.url) {
      const url = new URL(result.body.url)
      result.hostname = url.hostname
    }

    result.requestBytes = Buffer.from(JSON.stringify(result), 'utf-8')
    return <QRCodeResult>result
  }

  public async handleFetch(requestData: QRCodeResult): Promise<void> {
    console.log('handleFetch')
    await this.init()

    const fetchHandler = new FetchHandler(this.packageMgr!)
    console.log(this.did)
    const res = await fetchHandler.handleCredentialOffer(
      this.did!,
      requestData.requestBytes
    )

    console.log('handleCredentialOffer() result:')
    console.log(res)
    await this.credentialWallet!.saveAll(res)
    console.log('saved!')

    return res
  }

  public async handleAuthRequest(requestData: QRCodeResult): Promise<void> {
    console.log('handleAuthRequest start')
    await this.init()

    const authHandler = new AuthHandler(
      this.packageMgr!,
      this.proofService!,
      this.credentialWallet!
    )

    let authRes
    try {
      console.log('handleAuthorizationRequestForGenesisDID')
      authRes = await authHandler.handleAuthorizationRequestForGenesisDID(
        this.did!,
        requestData.requestBytes
      )

      console.log('authRes:')
      console.log(authRes)
    } catch (err: any) {
      console.log('auth handler error!')
      console.log(err)
      Sentry.captureException(err)
      
      throw err
    }

    try {
      const response = await Axios.post(
        `${authRes!.authRequest!.body!.callbackUrl}`,
        authRes.token
      )
      return response.data
    } catch (err: any) {
      console.log('callback error!')
      if (err.response && err.response.status) {
        console.log(err.response.status)
      } else {
        console.log(err)
      }

      Sentry.captureException(err)
    }
  }

  private async init() {
    if (this.did) {
      return
    }

    this.emit('initializing', true)
    this.dataStorage = await this.initDataStorage()
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

    this.proofService = new ProofService(
      this.identityWallet,
      this.credentialWallet,
      circuitStorage,
      ethStorage
    )

    circuitStorage.saveCircuitData(
      CircuitId.AuthV2,
      await this.initCircuitStorage(CircuitId.AuthV2)
    )

    circuitStorage.saveCircuitData(
      CircuitId.AtomicQuerySigV2,
      await this.initCircuitStorage(CircuitId.AtomicQuerySigV2)
    )

    this.packageMgr = await this.getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      this.proofService.generateAuthV2Inputs.bind(this.proofService),
      this.proofService.verifyState.bind(this.proofService)
    )

    this.emit('initializing', false)
  }

  private async initCircuitStorage(circuitId: CircuitId): Promise<CircuitData> {
    const download: DownloadProgressEvent = {
      count: 1,
      total: 4,
    }

    this.emit('downloading', download)
    download.count++
    const verificationKey = await this.fetchPolygonFile(
      `${circuitId.toString()}/verification_key.json`
    )
    this.emit('downloading', download)
    download.count++
    const provingKey = await this.fetchPolygonFile(
      `${circuitId.toString()}/circuit_final.zkey`
    )
    this.emit('downloading', download)
    download.count++
    const wasm = await this.fetchPolygonFile(
      `${circuitId.toString()}/circuit.wasm`
    )
    this.emit('downloading', download)

    const circuitData = {
      circuitId,
      wasm,
      provingKey,
      verificationKey,
    }

    return circuitData
  }

  private async initDataStorage(): Promise<IDataStorage> {
    const conf: EthConnectionConfig = defaultEthConnectionConfig
    conf.contractAddress = '0x134B1BE34911E39A8397ec6289782989729807a4'
    conf.url = 'https://rpc-mumbai.maticvigil.com'

    const dataStorage = {
      credential: new CredentialStorage(
        await VeridaDataSourceFactory<W3CCredential>('polygonid_credentials3')
      ),
      identity: new IdentityStorage(
        await VeridaDataSourceFactory<Identity>('polygonid_identity3'),
        await VeridaDataSourceFactory<Profile>('polygonid_profile3')
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: new EthStateStorage(conf),
    }
    /*
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
*/
    return dataStorage
  }

  private initCredentialWallet(dataStorage: IDataStorage): CredentialWallet {
    return new CredentialWallet(dataStorage)
  }

  private async initIdentityWallet(
    dataStorage: IDataStorage,
    credentialWallet: ICredentialWallet
  ): Promise<IIdentityWallet> {
    const context = await AccountManager.getInstance().context
    const privateKeyStoreDatabase = await context!.openDatabase(
      'polygonid_keystore3'
    )

    const keyStore = new VeridaPrivateKeyStore(privateKeyStoreDatabase)
    //const keyStore = new InMemoryPrivateKeyStore()
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore)
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
    /*storageCache[`${CircuitId.AuthV2.toString()}/verification_key.json`] =
      '/Users/chriswere/polygon_circuits/1'
    storageCache[`${CircuitId.AuthV2.toString()}/circuit_final.zkey`] =
      '/Users/chriswere/polygon_circuits/2'
    storageCache[`${CircuitId.AuthV2.toString()}/circuit.wasm`] =
      '/Users/chriswere/polygon_circuits/3'*/

    let path
    if (storageCache[url]) {
      path = storageCache[url]
      const exists = await ReactNativeBlobUtil.fs.exists(path)
      if (!exists) {
        path = undefined
      }
    }

    if (!path) {
      url = `https://verida-static-resources.s3.amazonaws.com/polygonid/${url}`
      console.log('downloading', url)
      const res = await ReactNativeBlobUtil.config({
        // add this option that makes response data to be stored as a file,
        // this is much more performant.
        fileCache: true,
      }).fetch('GET', url)

      path = res.path()
      console.log('download complete', path)
      storageCache[url] = path
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

const VeridaDataSourceFactory = async <Type>(databaseName: string) => {
  const context = await AccountManager.getInstance().context
  const db = await context!.openDatabase(databaseName)
  return new VeridaDataSource<Type>(db)
}

/**
 * Generic data source
 */
class VeridaDataSource<Type> implements IDataSource<Type> {
  private database: IDatabase

  public constructor(database: IDatabase) {
    this.database = database
  }

  /** saves in the memory */
  public async save(key: string, value: Type, keyName = 'id'): Promise<void> {
    console.log(
      'VeridaDataSource.save: ',
      key,
      keyName,
      value,
      this.database.databaseName
    )
    let record: any = {}
    try {
      record = await this.database.get(key)
    } catch (err: any) {
      record._id = value[keyName]
      record.data = value
    }

    await this.database.save(record)
  }

  /** updates in the memory */
  patchData(value: Type[]): void {
    throw new Error('patchData Not supported')
  }

  /** gets value from from the memory */
  public async get(key: string, keyName = 'id'): Promise<Type | undefined> {
    console.log(
      'VeridaDataSource.get(): ',
      key,
      keyName,
      this.database.databaseName
    )
    const result = <Type>await this.database.get(key)
    return result.data
  }

  /** loads from value from the memory */
  public async load(): Promise<Type[]> {
    //console.log('load()', this.database.databaseName)
    const data = <Type[]>await this.database.getMany(
      {},
      {
        limit: 1000,
      }
    )
    //console.log(`returning ${data.length} items`)

    return data.map((item) => item.data)
  }

  /** deletes from value from the memory */
  public async delete(key: string, keyName = 'id'): Promise<void> {
    console.log('VeridaDataSource.delete(): ', key, keyName)
    const record: any = await this.database.get(key)
    await this.database.delete(record)
  }
}

/**
 * KeyStore that allows to import and get keys by alias.
 *
 * @export
 * @abstract
 * @beta
 * @class AbstractPrivateKeyStore
 */
class VeridaPrivateKeyStore implements AbstractPrivateKeyStore {
  private database: IDatabase

  public constructor(database: IDatabase) {
    this.database = database
  }
  //{"alias": "BJJ:d159756b0ce8ea6b0be569d1ba9ff63a4d8099c59bb6edb2aa8f5b3bcd9b1109", "key": "6461766573656564736565647365656473656564736565647365656475736572"}
  //{"alias": "BJJ:d159756b0ce8ea6b0be569d1ba9ff63a4d8099c59bb6edb2aa8f5b3bcd9b1109", "key": "6461766573656564736565647365656473656564736565647365656475736572"}
  //did:polygonid:polygon:mumbai:2qHtz8rrerMMAFEcQSRu6Mvajxx7vkNLptw7LSS6C4
  //did:polygonid:polygon:mumbai:2qHtz8rrerMMAFEcQSRu6Mvajxx7vkNLptw7LSS6C4
  /**
   * imports key by alias
   *
   * @abstract
   * @param {{ alias: string; key: string }} args - key alias and hex representation
   * @returns `Promise<void>`
   */
  public async import(args: { alias: string; key: string }): Promise<void> {
    const record = {
      _id: args.alias,
      value: args.key,
    }

    try {
      console.log(record)
      console.log(args.key, args.alias)
      const existingRecord = await this.database.get(args.alias)
      console.log('found existing key store entry')
      console.log(existingRecord)
      record._rev = existingRecord._rev
    } catch (err: any) {
      console.log('!!!! keystore error')
      console.log(err.message)
      // not found, which is fine
    }

    try {
      const res = await this.database.save(record)
    } catch (err) {
      console.log('!!!!!!! import error')
      console.log(err)
    }
  }
  /**
   * get key by alias
   *
   * @abstract
   * @param {{ alias: string }} args -key alias
   * @returns `Promise<string>`
   */
  public async get(args: { alias: string }): Promise<string> {
    try {
      const result: any = await this.database.get(args.alias)
      if (!result) {
        throw new Error('no key under given alias')
      }

      return result.value
    } catch (err) {
      console.log(err)
      throw new Error('no key under given alias')
    }
  }
}
