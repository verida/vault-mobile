import {
  AbstractPrivateKeyStore,
  AuthDataPrepareFunc,
  AuthHandler,
  AuthorizationRequestMessage,
  BjjProvider,
  CircuitData,
  CircuitId,
  CircuitStorage,
  CredentialsOfferMessage,
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
} from "@0xpolygonid/js-sdk";
import { Blockchain, DID, DidMethod, NetworkId } from "@iden3/js-iden3-core";
import { proving } from "@iden3/js-jwz";
import {
  IDatabase,
  AccountNodeDIDClientConfig,
  EnvironmentType,
} from "@verida/types";
import Axios from "axios";
import { Network, Context } from "@verida/client-ts";
import { AutoAccount } from "@verida/account-node";

const RPC_URL = "https://rpc-mumbai.maticvigil.com";
const CONTRACT_ADDRESS = "0x134B1BE34911E39A8397ec6289782989729807a4";

export interface PolygonIDManagerConfig {
  // TODO: Find a better way to pass the sensitive information to the manager.
  polygonIdSeed: string;
  veridaPrivateKey: string;
  environment: EnvironmentType;
  contextName: string;
  didClientConfig: AccountNodeDIDClientConfig;
}

// Convert a base64 encoded string to a Uint8Array.
const base64StringToUint8Array = (str: string): Uint8Array =>
  Uint8Array.from(window.atob(str), (c) => c.charCodeAt(0));

// TODO: Create a factory to call the init() after the constructor instead of expecting to called when instanciated elsewhere in the code.
export class PolygonIDManager {
  config: PolygonIDManagerConfig;
  context?: Context;
  did?: DID;
  identityWallet?: IIdentityWallet;
  credentialWallet?: ICredentialWallet;
  proofService?: IProofService;
  packageMgr?: IPackageManager;
  dataStorage?: IDataStorage;

  public constructor(config: PolygonIDManagerConfig) {
    this.config = config;
  }

  public async handleAuthorizationRequest(
    data: AuthorizationRequestMessage
  ): Promise<void> {
    const encodedData = Buffer.from(JSON.stringify(data), "utf-8");

    const authHandler = new AuthHandler(
      this.packageMgr!,
      this.proofService!,
      this.credentialWallet!
    );
    const authRes = await authHandler.handleAuthorizationRequestForGenesisDID(
      this.did!,
      encodedData
    );

    // TODO: Add a type to the axios response
    const response = await Axios.post(
      // TODO: Do not assume the callback URL is in the body with '!', check it first. Throw an error if missing.
      `${authRes!.authRequest!.body!.callbackUrl}`,
      authRes.token
    );
    return response.data;
  }

  public async handleCredentialOffer(
    data: CredentialsOfferMessage
  ): Promise<void> {
    const encodedData = Buffer.from(JSON.stringify(data), "utf-8");

    const fetchHandler = new FetchHandler(this.packageMgr!);
    const res = await fetchHandler.handleCredentialOffer(
      this.did!,
      encodedData
    );

    await this.credentialWallet!.saveAll(res);
  }

  public async shouldInit() {
    console.log("shouldInit()");
    if (this.did) {
      return;
    }

    await this.initVeridaContext();
    console.log("initVeridaContext()");

    //this.emit("initializing", true);
    this.dataStorage = await this.initDataStorage();
    console.log("initDataStorage()");

    this.credentialWallet = this.initCredentialWallet(this.dataStorage);
    console.log("initCredentialWallet()");

    this.identityWallet = await this.initIdentityWallet(
      this.dataStorage,
      this.credentialWallet
    );
    console.log("initIdentityWallet()");

    const { did } = await this.identityWallet.createIdentity(
      "https://mywallet.com", // this is url that will be a part of auth bjj credential identifier
      {
        method: DidMethod.PolygonId,
        blockchain: Blockchain.Polygon,
        networkId: NetworkId.Mumbai,
        seed: new Uint8Array(Buffer.from(this.config.polygonIdSeed, "utf-8")),
        rhsUrl: "https://rhs-staging.polygonid.me/", // url to check revocation status of auth bjj credential, if it's not set hostUrl is used.
      }
    );

    console.log("createIdentity()");

    this.did = did;

    const circuitStorage = new CircuitStorage(
      new InMemoryDataSource<CircuitData>()
    );

    console.log("CircuitStorage()");

    const conf = defaultEthConnectionConfig;
    conf.url = RPC_URL;
    conf.contractAddress = CONTRACT_ADDRESS;
    const ethStorage = new EthStateStorage(conf);

    console.log("EthStateStorage()");

    this.proofService = new ProofService(
      this.identityWallet,
      this.credentialWallet,
      circuitStorage,
      ethStorage
    );

    console.log("ProofService()");

    await circuitStorage.saveCircuitData(
      CircuitId.AuthV2,
      await this.initCircuitStorage(CircuitId.AuthV2)
    );

    console.log("saveCircuitData()");

    await circuitStorage.saveCircuitData(
      CircuitId.AtomicQuerySigV2,
      await this.initCircuitStorage(CircuitId.AtomicQuerySigV2)
    );

    console.log("saveCircuitData()");

    this.packageMgr = await this.getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      this.proofService.generateAuthV2Inputs.bind(this.proofService),
      this.proofService.verifyState.bind(this.proofService)
    );

    console.log("getPackageMgr()");

    //this.emit("initializing", false);
  }

  private static async fetchAndDecodeBase64EncodedFile(url: string) {
    const req = await fetch(url);

    const maybeFileContent = await req.text();

    if (typeof maybeFileContent !== "string" || !maybeFileContent.length)
      throw new Error(
        `Expected string file, encountered "${String(maybeFileContent)}".`
      );

    return base64StringToUint8Array(maybeFileContent);
  }

  private async initCircuitStorage(circuitId: CircuitId): Promise<CircuitData> {
    // Our expectation is that the relevant files have been stored at the root directory
    // by the React Native runtime. These should be saved at the server directory as:
    // <server-dir>/public/circuits/<circuit-id>/<circuit-name>.<type>
    // TODO: Update the location (don't need the 'public' part)
    const [verificationKey, provingKey, wasm] = await Promise.all([
      PolygonIDManager.fetchAndDecodeBase64EncodedFile(
        `/public/circuits/${circuitId}/verification_key.base64`
      ),
      PolygonIDManager.fetchAndDecodeBase64EncodedFile(
        `/public/circuits/${circuitId}/circuit_final.base64`
      ),
      PolygonIDManager.fetchAndDecodeBase64EncodedFile(
        `/public/circuits/${circuitId}/wasm.base64`
      ),
    ]);

    return { circuitId: String(circuitId), verificationKey, provingKey, wasm };
  }

  private async initDataStorage(): Promise<IDataStorage> {
    const conf: EthConnectionConfig = defaultEthConnectionConfig;
    conf.contractAddress = "0x134B1BE34911E39A8397ec6289782989729807a4";
    conf.url = "https://rpc-mumbai.maticvigil.com";

    const dataStorage = {
      credential: new CredentialStorage(
        await this.buildDataSource<W3CCredential>("polygonid_credentials3")
      ),
      identity: new IdentityStorage(
        await this.buildDataSource<Identity>("polygonid_identity3"),
        await this.buildDataSource<Profile>("polygonid_profile3")
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: new EthStateStorage(conf),
    };
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
    return dataStorage;
  }

  private initCredentialWallet(dataStorage: IDataStorage): CredentialWallet {
    return new CredentialWallet(dataStorage);
  }

  private async initIdentityWallet(
    dataStorage: IDataStorage,
    credentialWallet: ICredentialWallet
  ): Promise<IIdentityWallet> {
    const privateKeyStoreDatabase = await this.context!.openDatabase(
      "polygonid_keystore3"
    );

    const keyStore = new VeridaPrivateKeyStore(privateKeyStoreDatabase);
    //const keyStore = new InMemoryPrivateKeyStore()
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    return new IdentityWallet(kms, dataStorage, credentialWallet);
  }

  private getPackageMgr(
    circuitData: CircuitData,
    prepareFn: AuthDataPrepareFunc,
    stateVerificationFn: StateVerificationFunc
  ): IPackageManager {
    const authInputsHandler = new DataPrepareHandlerFunc(prepareFn);

    const verificationFn = new VerificationHandlerFunc(stateVerificationFn);
    const mapKey =
      proving.provingMethodGroth16AuthV2Instance.methodAlg.toString();
    const verificationParamMap: Map<string, VerificationParams> = new Map([
      [
        mapKey,
        {
          key: circuitData.verificationKey,
          verificationFn,
        },
      ],
    ]);

    const provingParamMap: Map<string, ProvingParams> = new Map();
    provingParamMap.set(mapKey, {
      dataPreparer: authInputsHandler,
      provingKey: circuitData.provingKey,
      wasm: circuitData.wasm,
    });

    const mgr: IPackageManager = new PackageManager();
    const packer = new ZKPPacker(provingParamMap, verificationParamMap);
    const plainPacker = new PlainPacker();
    mgr.registerPackers([packer, plainPacker]);

    return mgr;
  }

  private async initVeridaContext() {
    if (this.context) {
      return;
    }

    // Create a connection to the network and open your context
    this.context = await Network.connect({
      context: {
        name: this.config.contextName,
      },
      client: {
        environment: this.config.environment,
      },
      account: new AutoAccount(
        {
          defaultDatabaseServer: {
            type: "VeridaDatabase",
            endpointUri: [],
          },
          defaultMessageServer: {
            type: "VeridaMessage",
            endpointUri: [],
          },
        },
        {
          privateKey: this.config.veridaPrivateKey,
          environment: this.config.environment,
          didClientConfig: this.config.didClientConfig,
        }
      ),
    });
  }

  private async buildDataSource<Type>(databaseName: string) {
    const db = await this.context!.openDatabase(databaseName);
    return new VeridaDataSource<Type>(db);
  }
}

/**
 * Generic data source
 */
class VeridaDataSource<Type> implements IDataSource<Type> {
  private database: IDatabase;

  public constructor(database: IDatabase) {
    this.database = database;
  }

  /** saves in the memory */
  public async save(key: string, value: Type, keyName = "id"): Promise<void> {
    console.log(
      "VeridaDataSource.save: ",
      key,
      keyName,
      value,
      // @ts-ignore
      this.database.databaseName
    );
    let record: any = {};
    try {
      record = await this.database.get(key);
    } catch (err: any) {
      // @ts-ignore
      record._id = value[keyName];
      record.data = value;
    }

    await this.database.save(record);
  }

  /** updates in the memory */
  patchData(value: Type[]): void {
    throw new Error("patchData Not supported");
  }

  /** gets value from from the memory */
  public async get(key: string, keyName = "id"): Promise<Type | undefined> {
    console.log(
      "VeridaDataSource.get(): ",
      key,
      keyName,
      // @ts-ignore
      this.database.databaseName
    );
    const result = (await this.database.get(key)) as Type;
    // @ts-ignore
    return result.data;
  }

  /** loads from value from the memory */
  public async load(): Promise<Type[]> {
    //console.log('load()', this.database.databaseName)
    const data = (await this.database.getMany(
      {},
      {
        limit: 1000,
      }
    )) as Type[];
    //console.log(`returning ${data.length} items`)

    // @ts-ignore
    return data.map((item) => item.data);
  }

  /** deletes from value from the memory */
  public async delete(key: string, keyName = "id"): Promise<void> {
    console.log("VeridaDataSource.delete(): ", key, keyName);
    const record: any = await this.database.get(key);
    await this.database.delete(record);
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
  private database: IDatabase;

  public constructor(database: IDatabase) {
    this.database = database;
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
    };

    try {
      console.log(record);
      console.log(args.key, args.alias);
      const existingRecord = await this.database.get(args.alias);
      console.log("found existing key store entry");
      console.log(existingRecord);
      // @ts-ignore
      record._rev = existingRecord._rev;
    } catch (err: any) {
      console.log("!!!! keystore error");
      console.log(err.message);
      // not found, which is fine
    }

    try {
      await this.database.save(record);
    } catch (err) {
      console.log("!!!!!!! import error");
      console.log(err);
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
      const result: any = await this.database.get(args.alias);
      if (!result) {
        throw new Error("no key under given alias");
      }

      return result.value;
    } catch (err) {
      console.log(err);
      throw new Error("no key under given alias");
    }
  }
}
