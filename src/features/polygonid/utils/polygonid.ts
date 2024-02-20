import {
  AgentResolver,
  AuthDataPrepareFunc,
  BjjProvider,
  CircuitData,
  CircuitStorage,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  CredentialStorage,
  CredentialWallet,
  DataPrepareHandlerFunc,
  EthConnectionConfig,
  EthStateStorage,
  IDataStorage,
  Identity,
  IdentityStorage,
  IdentityWallet,
  InMemoryMerkleTreeStorage,
  IssuerResolver,
  IStateStorage,
  KMS,
  KmsKeyType,
  OnChainResolver,
  PackageManager,
  PlainPacker,
  Profile,
  ProofService,
  ProvingParams,
  RHSResolver,
  StateVerificationFunc,
  VerificationHandlerFunc,
  VerificationParams,
  W3CCredential,
  ZKPPacker,
} from '@0xpolygonid/js-sdk'
import { proving, ProvingMethod, ProvingMethodAlg } from '@iden3/js-jwz'
import { Context } from '@verida/client-rn'

import {
  POLYGON_ID_CREDENTIALS_DATABASE_NAME,
  POLYGON_ID_IDENTITY_DATABASE_NAME,
  POLYGON_ID_KEYSTORE_DATABASE_NAME,
  POLYGON_ID_PROFILE_DATABASE_NAME,
} from '../constants'
import { PolygonIdConfig, WitnessCalculatorFunction } from '../types'
import { Groth16ProvingMethod, ZkProver } from './prover'
import {
  buildPolygonIdVeridaDataSource,
  getVeridaDatabase,
  PolygonIdVeridaPrivateKeyStore,
} from './storage'

export async function buildDataStorage(
  veridaContext: Context,
  ethConnectionConfig: EthConnectionConfig
): Promise<IDataStorage> {
  // TODO: Build the data source in parallel
  const dataStorage: IDataStorage = {
    credential: new CredentialStorage(
      await buildPolygonIdVeridaDataSource<W3CCredential>(
        veridaContext,
        POLYGON_ID_CREDENTIALS_DATABASE_NAME
      )
    ),
    identity: new IdentityStorage(
      await buildPolygonIdVeridaDataSource<Identity>(
        veridaContext,
        POLYGON_ID_IDENTITY_DATABASE_NAME
      ),
      await buildPolygonIdVeridaDataSource<Profile>(
        veridaContext,
        POLYGON_ID_PROFILE_DATABASE_NAME
      )
    ),
    mt: new InMemoryMerkleTreeStorage(40),
    states: new EthStateStorage(ethConnectionConfig),
  }

  return dataStorage
}

export function buildCredentialWallet(
  dataStorage: IDataStorage,
  ethConnectionConfig: EthConnectionConfig
) {
  const statusRegistry = new CredentialStatusResolverRegistry()

  statusRegistry.register(
    CredentialStatusType.SparseMerkleTreeProof,
    new IssuerResolver()
  )

  statusRegistry.register(
    CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
    new RHSResolver(dataStorage.states)
  )

  statusRegistry.register(
    CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
    new OnChainResolver([ethConnectionConfig])
  )

  statusRegistry.register(
    CredentialStatusType.Iden3commRevocationStatusV1,
    new AgentResolver()
  )

  return new CredentialWallet(dataStorage, statusRegistry)
}

export async function buildIdentityWallet(
  veridaContext: Context,
  dataStorage: IDataStorage,
  credentialWallet: CredentialWallet
): Promise<IdentityWallet> {
  const privateKeyStoreDatabase = await getVeridaDatabase(
    veridaContext,
    POLYGON_ID_KEYSTORE_DATABASE_NAME
  )
  const keyStore = new PolygonIdVeridaPrivateKeyStore(privateKeyStoreDatabase)
  const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore)
  const kms = new KMS()
  kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider)

  return new IdentityWallet(kms, dataStorage, credentialWallet)
}

export function buildProofService(
  identityWallet: IdentityWallet,
  credentialWallet: CredentialWallet,
  circuitStorage: CircuitStorage,
  stateStorage: IStateStorage,
  witnessCalculator: WitnessCalculatorFunction,
  config: PolygonIdConfig
) {
  return new ProofService(
    identityWallet,
    credentialWallet,
    circuitStorage,
    stateStorage,
    {
      ipfsGatewayURL: config.polygonIdIpfsGatewayUrl,
      prover: new ZkProver(circuitStorage, witnessCalculator),
    }
  )
}

export async function buildPackageManager(
  circuitData: CircuitData,
  prepareFn: AuthDataPrepareFunc,
  stateVerificationFn: StateVerificationFunc,
  witnessCalculator: WitnessCalculatorFunction
): Promise<PackageManager> {
  const provingMethodGroth16AuthV2Instance: ProvingMethod =
    new Groth16ProvingMethod(
      new ProvingMethodAlg(
        proving.provingMethodGroth16AuthV2Instance.alg,
        proving.provingMethodGroth16AuthV2Instance.circuitId
      ),
      witnessCalculator
    )

  await proving.registerProvingMethod(
    proving.provingMethodGroth16AuthV2Instance.methodAlg,
    () => provingMethodGroth16AuthV2Instance
  )

  const authInputsHandler = new DataPrepareHandlerFunc(prepareFn)

  const verificationFn = new VerificationHandlerFunc(stateVerificationFn)
  const mapKey = proving.provingMethodGroth16AuthV2Instance.methodAlg.toString()
  const verificationParamMap: Map<string, VerificationParams> = new Map([
    [
      mapKey,
      {
        key: circuitData.verificationKey!,
        verificationFn,
      },
    ],
  ])

  const provingParamMap: Map<string, ProvingParams> = new Map()
  provingParamMap.set(mapKey, {
    dataPreparer: authInputsHandler,
    provingKey: circuitData.provingKey!,
    wasm: circuitData.wasm!,
  })

  const packer = new ZKPPacker(provingParamMap, verificationParamMap)
  const plainPacker = new PlainPacker()

  const packageManager = new PackageManager()
  packageManager.registerPackers([packer, plainPacker])

  return packageManager
}

export function createPolygonIdIdentity(
  identityWallet: IdentityWallet,
  config: PolygonIdConfig,
  privateKey: string
) {
  return identityWallet.createIdentity({
    method: config.polygonIdDidMethod,
    blockchain: config.polygonIdBlockchain,
    networkId: config.polygonIdNetworkId,
    seed: new Uint8Array(Buffer.from(privateKey, 'utf-8')),
    revocationOpts: {
      id: config.polygonIdRevocationBaseUrl,
      type: config.polygonIdRevocationType,
    },
  })
}
