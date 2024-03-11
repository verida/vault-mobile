import {
  AgentResolver,
  AuthDataPrepareFunc,
  BjjProvider,
  CircuitData,
  CircuitStorage,
  core,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  CredentialStorage,
  CredentialWallet,
  DataPrepareHandlerFunc,
  defaultEthConnectionConfig,
  EthConnectionConfig,
  EthStateStorage,
  IDataStorage,
  Identity,
  IdentityStorage,
  IdentityWallet,
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
  VerifiableConstants,
  VerificationHandlerFunc,
  VerificationParams,
  W3CCredential,
  ZKPPacker,
} from '@0xpolygonid/js-sdk'
import { proving, ProvingMethod, ProvingMethodAlg } from '@iden3/js-jwz'
import { Context } from '@verida/client-rn'
import { Logger } from 'features/telemetry'
import { VeridaRecord } from 'features/verida'

import { config as appConfig } from '~/config'

import {
  POLYGON_ID_CREDENTIALS_DATABASE_NAME,
  POLYGON_ID_IDENTITY_DATABASE_NAME,
  POLYGON_ID_KEYSTORE_DATABASE_NAME,
  POLYGON_ID_MERKLE_TREE_DATABASE_NAME,
  POLYGON_ID_PROFILE_DATABASE_NAME,
} from '../constants'
import { CalculateWitnessFunction, PolygonIdIdentityConfig } from '../types'
import { Groth16ProvingMethod, ZkProver } from './prover'
import {
  buildPolygonIdVeridaDataSource,
  buildPolygonIdVeridaMerkleTreeDataSource,
  getVeridaDatabase,
  PolygonIdVeridaMerkleTreeStorage,
  PolygonIdVeridaPrivateKeyStore,
} from './storage'

const logger = Logger.create('PolygonId')

export function getBlockchainConfigs(): EthConnectionConfig[] {
  const polygonMainnetConfig: EthConnectionConfig = {
    ...defaultEthConnectionConfig,
    chainId: core.ChainIds[core.NetworkId.Main],
    contractAddress: appConfig.polygonId.mainnet.contractAddress,
    url: appConfig.polygonId.mainnet.rpcUrl,
  }

  const polygonMumbaiConfig: EthConnectionConfig = {
    ...defaultEthConnectionConfig,
    chainId: core.ChainIds[core.NetworkId.Mumbai],
    contractAddress: appConfig.polygonId.testnet.contractAddress,
    url: appConfig.polygonId.testnet.rpcUrl,
  }

  return [polygonMainnetConfig, polygonMumbaiConfig]
}

export async function buildDataStorage(
  veridaContext: Context,
  blockchainConfigs: EthConnectionConfig[]
): Promise<IDataStorage> {
  logger.debug('Building data storage...')

  try {
    // TODO: Build the data sources in parallel
    // This is commented out because it seems more stable at startup, used to have many issues such as 'database does not exist', etc.
    // const [credentialsDataSource, identitiesDataSource, profilesDataSource] =
    //   await Promise.all([
    //     await buildPolygonIdVeridaDataSource<W3CCredential>(
    //       veridaContext,
    //       POLYGON_ID_CREDENTIALS_DATABASE_NAME
    //     ),
    //     await buildPolygonIdVeridaDataSource<Identity>(
    //       veridaContext,
    //       POLYGON_ID_IDENTITY_DATABASE_NAME
    //     ),
    //     await buildPolygonIdVeridaDataSource<Profile>(
    //       veridaContext,
    //       POLYGON_ID_PROFILE_DATABASE_NAME
    //     ),
    //   ])

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
      mt: new PolygonIdVeridaMerkleTreeStorage(
        await buildPolygonIdVeridaMerkleTreeDataSource(
          veridaContext,
          POLYGON_ID_MERKLE_TREE_DATABASE_NAME
        ),
        40
      ),
      states: new EthStateStorage(blockchainConfigs),
    }

    logger.info('Data storage built successfully')
    return dataStorage
  } catch (error) {
    throw new Error(`Failed to build data storage`, {
      cause: error,
    })
  }
}

export function buildCredentialWallet(
  dataStorage: IDataStorage,
  blockchainConfigs: EthConnectionConfig[]
) {
  logger.debug('Building credential wallet...')

  try {
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
      new OnChainResolver(blockchainConfigs)
    )

    statusRegistry.register(
      CredentialStatusType.Iden3commRevocationStatusV1,
      new AgentResolver()
    )

    const credentialWallet = new CredentialWallet(dataStorage, statusRegistry)

    logger.info('Credential wallet built successfully')
    return credentialWallet
  } catch (error) {
    throw new Error('Failed to build credential wallet', {
      cause: error,
    })
  }
}

export async function buildIdentityWallet(
  veridaContext: Context,
  dataStorage: IDataStorage,
  credentialWallet: CredentialWallet
): Promise<IdentityWallet> {
  logger.debug('Building identity wallet...')

  try {
    const privateKeyStoreDatabase = await getVeridaDatabase(
      veridaContext,
      POLYGON_ID_KEYSTORE_DATABASE_NAME
    )
    const keyStore = new PolygonIdVeridaPrivateKeyStore(privateKeyStoreDatabase)
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore)
    const kms = new KMS()
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider)

    const identityWallet = new IdentityWallet(
      kms,
      dataStorage,
      credentialWallet
    )

    logger.info('Identity Wallet built successfully')
    return identityWallet
  } catch (error) {
    throw new Error('Failed to build identity wallet', {
      cause: error,
    })
  }
}

export function buildProofService(
  identityWallet: IdentityWallet,
  credentialWallet: CredentialWallet,
  circuitStorage: CircuitStorage,
  stateStorage: IStateStorage,
  calculateWitness: CalculateWitnessFunction,
  ipfsGatewayURL?: string
) {
  logger.debug('Building proof service...')

  try {
    const proofService = new ProofService(
      identityWallet,
      credentialWallet,
      circuitStorage,
      stateStorage,
      {
        ipfsGatewayURL,
        prover: new ZkProver(circuitStorage, calculateWitness),
      }
    )

    logger.info('Proof service built successfully')
    return proofService
  } catch (error) {
    throw new Error('Failed to build proof service', {
      cause: error,
    })
  }
}

export async function buildPackageManager(
  circuitData: CircuitData,
  prepareFn: AuthDataPrepareFunc,
  stateVerificationFn: StateVerificationFunc,
  calculateWitness: CalculateWitnessFunction
): Promise<PackageManager> {
  logger.debug('Building package manager...')

  try {
    const provingMethodGroth16AuthV2Instance: ProvingMethod =
      new Groth16ProvingMethod(
        new ProvingMethodAlg(
          proving.provingMethodGroth16AuthV2Instance.alg,
          proving.provingMethodGroth16AuthV2Instance.circuitId
        ),
        calculateWitness
      )

    await proving.registerProvingMethod(
      proving.provingMethodGroth16AuthV2Instance.methodAlg,
      () => provingMethodGroth16AuthV2Instance
    )

    const authInputsHandler = new DataPrepareHandlerFunc(prepareFn)

    const verificationFn = new VerificationHandlerFunc(stateVerificationFn)
    const mapKey =
      proving.provingMethodGroth16AuthV2Instance.methodAlg.toString()
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

    logger.info('Package Manager built successfully')
    return packageManager
  } catch (error) {
    throw new Error('Failed to build package manager', {
      cause: error,
    })
  }
}

export async function getOrCreatePolygonIdIdentity(
  identityWallet: IdentityWallet,
  dataStorage: IDataStorage,
  config: PolygonIdIdentityConfig,
  privateKey: string
): Promise<core.DID> {
  try {
    logger.debug('Getting existing Polygon ID identities')
    const allIdentities = await dataStorage.identity.getAllIdentities()
    if (allIdentities.length > 0) {
      logger.info('Using existing Polygon ID identity')
      return core.DID.parse(allIdentities[0].did)
      // Should not have multiple ones
    }

    logger.debug('Creating Polygon ID identity')
    const result = await identityWallet.createIdentity({
      method: config.didMethod,
      blockchain: config.blockchain,
      networkId: config.networkId,
      seed: new Uint8Array(Buffer.from(privateKey, 'utf-8')),
      revocationOpts: {
        id: config.revocationBaseUrl,
        type: config.revocationType,
      },
    })

    logger.info('Polygon ID identity created successfully')
    return result.did
  } catch (error) {
    throw new Error('Failed to get or create Polygon ID identity', {
      cause: error,
    })
  }
}

export async function migratePolygonIdData(veridaContext: Context) {
  logger.info('Checking Polygon ID data for migration...')

  type PolygonIdVeridaRecord<Type> = VeridaRecord<{ data: Type }>

  // Checking Merkle Trees

  logger.debug('Opening merkle tree database')
  const merkleTreeDatabase = await getVeridaDatabase(
    veridaContext,
    POLYGON_ID_MERKLE_TREE_DATABASE_NAME
  )

  logger.debug('Fetching merkle tree records')
  const mts = await merkleTreeDatabase.getMany(
    {},
    {
      limit: 1,
    }
  )
  if (mts.length > 0) {
    logger.info('Merkle trees found, no migration needed')
    return
  }
  logger.info('No merkle trees found, migration needed')

  // Identities

  logger.debug('Opening identity database')
  const identityDatabase = await getVeridaDatabase(
    veridaContext,
    POLYGON_ID_IDENTITY_DATABASE_NAME
  )

  logger.debug('Deleting all identities from database')
  await identityDatabase.deleteAll()
  logger.info('All identities deleted from database')

  // Profiles

  logger.debug('Opening profile database')
  const profileDatabase = await getVeridaDatabase(
    veridaContext,
    POLYGON_ID_PROFILE_DATABASE_NAME
  )

  logger.debug('Deleting all profiles from database')
  await profileDatabase.deleteAll()
  logger.info('All profiles deleted from database')

  // Identity credentials

  logger.debug('Opening credential database')
  const credentialDatabase = await getVeridaDatabase(
    veridaContext,
    POLYGON_ID_CREDENTIALS_DATABASE_NAME
  )

  // We only want to delete the identity credentials (see filter below)
  // Expecting a large number of credentials
  // But not expecting a large number of non-identity credentials
  let recordsLeft = true
  do {
    logger.debug('Fetching identity credentials from database')
    const credentialsToDelete = (await credentialDatabase.getMany(
      {
        'data.credentialSubject.type':
          VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
        'data.credentialSubject.x': { $exists: true },
        'data.credentialSubject.y': { $exists: true },
      },
      {
        limit: 1000,
      }
    )) as PolygonIdVeridaRecord<W3CCredential>[]

    if (credentialsToDelete.length === 0) {
      // If there are no credentialsToDelete in a batch, we can consider there are non left, we can stop the loop
      recordsLeft = false
      logger.debug('No more identity credentials in database')
    } else {
      recordsLeft = true
      logger.debug('Deleting identity credentials from database')
      credentialsToDelete.forEach((credential) => {
        credentialDatabase.delete(credential)
      })
    }

    // Iterate as long as there are credentialsToDelete left
  } while (recordsLeft)
  logger.info('All identity credentials deleted from database')

  logger.info('Polygon ID data migration complete')
}
