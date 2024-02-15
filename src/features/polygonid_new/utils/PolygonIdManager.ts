import {
  AuthHandler,
  AuthorizationRequestMessage,
  CircuitId,
  core,
  CredentialsOfferMessage,
  CredentialWallet,
  defaultEthConnectionConfig,
  FetchHandler,
  IDataStorage,
  IdentityWallet,
  PackageManager,
  ProofService,
} from '@0xpolygonid/js-sdk'
import { Context } from '@verida/client-rn'
import { Logger } from 'features/telemetry'

import { PolygonIdConfig, WitnessCalculatorFunction } from '../types'
import {
  buildCredentialWallet,
  buildDataStorage,
  buildIdentityWallet,
  buildPackageManager,
  buildProofService,
  createCircuitStorage,
  createPolygonIdIdentity,
  initCircuitStorage,
} from './polygonid'

const logger = new Logger('PolygonId')

export class PolygonIdManager {
  private config: PolygonIdConfig
  private veridaContext: Context
  did?: core.DID
  identityWallet?: IdentityWallet
  credentialWallet?: CredentialWallet
  proofService?: ProofService
  packageManager?: PackageManager
  dataStorage?: IDataStorage
  authHandler?: AuthHandler
  fetchHandler?: FetchHandler

  private constructor(config: PolygonIdConfig, veridaContext: Context) {
    this.config = config
    this.veridaContext = veridaContext
  }

  public static async createManager(
    config: PolygonIdConfig,
    identityPrivatekey: string,
    veridaVaultContext: Context,
    witnessCalculator: WitnessCalculatorFunction
  ): Promise<PolygonIdManager> {
    const instance = new PolygonIdManager(config, veridaVaultContext)
    await instance.init(identityPrivatekey, witnessCalculator)
    return instance
  }

  private async init(
    identityPrivatekey: string,
    witnessCalculator: WitnessCalculatorFunction
  ) {
    logger.info('Initialising a Polygon Id Manager')

    const ethConnectionConfig = defaultEthConnectionConfig
    ethConnectionConfig.contractAddress = this.config.polygonIdContractAddress
    ethConnectionConfig.url = this.config.polygonIdRpcUrl

    this.dataStorage = await buildDataStorage(
      this.veridaContext,
      ethConnectionConfig
    )

    logger.info('Data storage built successfully')

    this.credentialWallet = buildCredentialWallet(
      this.dataStorage,
      ethConnectionConfig
    )

    logger.info('Credential Wallet built successfully')

    this.identityWallet = await buildIdentityWallet(
      this.veridaContext,
      this.dataStorage,
      this.credentialWallet
    )

    logger.info('Identity Wallet built successfully')

    const { did } = await createPolygonIdIdentity(
      this.identityWallet,
      this.config,
      identityPrivatekey
    )
    this.did = did

    logger.info('Polygon ID identity created successfully')

    const circuitStorage = createCircuitStorage()

    logger.info('Circuit storage created successfully')

    this.proofService = buildProofService(
      this.identityWallet,
      this.credentialWallet,
      circuitStorage,
      this.dataStorage.states,
      witnessCalculator,
      this.config
    )

    logger.info('Proof service built successfully')

    await initCircuitStorage(circuitStorage)

    logger.info('Circuit storage initialised successfully')

    this.packageManager = await buildPackageManager(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      this.proofService.generateAuthV2Inputs.bind(this.proofService),
      this.proofService.verifyState.bind(this.proofService),
      witnessCalculator
    )

    logger.info('Package Manager built successfully')

    this.authHandler = new AuthHandler(this.packageManager, this.proofService)
    logger.info('AuthHandler created successfully')

    this.fetchHandler = new FetchHandler(this.packageManager)
    logger.info('FetchHandler created successfully')
  }

  /**
   * Process an authorization request
   *
   * @param message
   * @returns
   */
  public async handleAuthorizationRequest(
    _message: AuthorizationRequestMessage
  ) {
    throw new Error('Not implemented')
  }

  /**
   * Process a credential offer.
   *
   * @param message the offer message.
   * @returns The credentials
   */
  public async handleCredentialsOffer(_message: CredentialsOfferMessage) {
    throw new Error('Not implemented')
  }
}
