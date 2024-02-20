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
  W3CCredential,
} from '@0xpolygonid/js-sdk'
import { Context } from '@verida/client-rn'
import Axios, { AxiosRequestConfig } from 'axios'
import { VAULT_SCHEMA_CREDENTIAL_BASE_0_2_0 } from 'features/vault'

import { PolygonIdConfig, WitnessCalculatorFunction } from '../types'
import { createCircuitStorage, initCircuitStorage } from './circuits'
import { polygonIdLogger as logger } from './logger'
import {
  buildCredentialWallet,
  buildDataStorage,
  buildIdentityWallet,
  buildPackageManager,
  buildProofService,
  createPolygonIdIdentity,
} from './polygonid'
import { getVeridaDatastore } from './storage'

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

    const { did } = await createPolygonIdIdentity(
      this.identityWallet,
      this.config,
      identityPrivatekey
    )
    this.did = did
    logger.info('Polygon ID identity created successfully')
  }

  /**
   * Process an authorization request
   *
   * @param message
   * @returns
   */
  public async handleAuthorizationRequest(
    message: AuthorizationRequestMessage
  ) {
    logger.info('Receive an authorization request')

    const encodedMessage = new TextEncoder().encode(JSON.stringify(message))

    logger.info('Handling the authorization request with Polygon ID SDK')

    if (!this.authHandler) {
      throw new Error('Cannot handle request as AuthHandler is undefined')
    }

    if (!this.did) {
      throw new Error('Cannot handle request as user DID is undefined')
    }

    const result = await this.authHandler.handleAuthorizationRequest(
      this.did,
      encodedMessage
    )

    try {
      let response
      if (result.authRequest.body?.callbackUrl) {
        logger.info('Calling authorization request callback')

        const config: AxiosRequestConfig = {
          headers: {
            'Content-Type': 'text/plain',
          },
          responseType: 'json',
        }

        // TODO: Add a type to the axios response
        response = await Axios.post(
          result.authRequest.body.callbackUrl,
          result.token,
          config
        )

        logger.info('Authorization request callback called successfully')
      } else {
        logger.warn('No callback to call in the authorization request')
      }

      return {
        callbackResponse: response?.data,
        authResponse: result.authResponse,
      }
    } catch (error) {
      logger.warn('Error calling authorization request callback')
      // Rethrow the error so the UI actually shows something went wrong
      throw error
    }
  }

  /**
   * Process a credential offer.
   *
   * @param message the offer message.
   * @returns The credentials
   */
  public async handleCredentialsOffer(message: CredentialsOfferMessage) {
    logger.info('Receive a credentials offer')

    const encodedData = new TextEncoder().encode(JSON.stringify(message))

    if (!this.fetchHandler) {
      throw new Error('Cannot handle offer as FetchHandler is undefined')
    }

    if (!this.credentialWallet) {
      throw new Error('Cannot handle offer as CredentialWallet is undefined')
    }

    logger.info('Handling the credentials offer with Polygon ID SDK')

    const credentials = await this.fetchHandler.handleCredentialOffer(
      encodedData
    )

    logger.info('Saving the credentials in the Polygon ID credential wallet')
    await this.credentialWallet.saveAll(credentials)

    logger.info('Saving the credentials in the Verida Vault of the account')
    await this.saveCredentials(credentials)

    return credentials
  }

  public async acceptConnectionRequest(message: AuthorizationRequestMessage) {
    logger.info('Accepting connection request')
    try {
      const result = await this.handleAuthorizationRequest(message)
      return { result }
    } catch (cause) {
      const error = new Error(
        // TODO: Adapt the error message to the type of error
        // The error message must be user-friendly, as it will be displayed in the UI
        'Something went wrong when accepting the Polygon ID connection request',
        { cause }
      )
      logger.error(error)
      return {
        error,
      }
    }
  }

  public async acceptProofRequest(message: AuthorizationRequestMessage) {
    logger.info('Accepting proof request')

    try {
      const result = await this.handleAuthorizationRequest(message)
      return { result }
    } catch (cause: unknown) {
      const error = new Error(
        // TODO: Adapt the error message to the type of error
        // The error message must be user-friendly, as it will be displayed in the UI
        'Something went wrong when answering the Polygon ID proof request',
        { cause }
      )
      logger.error(error)
      return {
        error,
      }
    }
  }

  public async acceptCredentialsOffer(message: CredentialsOfferMessage) {
    logger.info('Accepting credential offer')

    try {
      const result = await this.handleCredentialsOffer(message)
      return { result }
    } catch (cause: unknown) {
      const error = new Error(
        // TODO: Adapt the error message to the type of error
        // The error message must be user-friendly, as it will be displayed in the UI
        'Something went wrong when accepting the Polygon ID credential offer.',
        { cause }
      )
      logger.error(error)
      return {
        error,
      }
    }
  }

  /**
   * Save a credential to the Verida credential datastore.
   * This record will then appear in the `Credential` section of the mobile app
   *
   * @param credentials
   */
  private async saveCredentials(credentials: W3CCredential[]): Promise<void> {
    logger.info(
      "Saving credentials to the account's Vault credentials datastore"
    )

    if (!this.veridaContext) {
      throw new Error(
        "Cannot save credentials to account's Vault as Verida Context is undefined"
      )
    }

    const credentialDatastore = await getVeridaDatastore(
      this.veridaContext,
      VAULT_SCHEMA_CREDENTIAL_BASE_0_2_0
    )

    const results = await Promise.allSettled(
      credentials.map(async (credential) => {
        const name =
          credential.credentialSubject.type || 'Polygon ID credential' // TODO: Define a better fallback name
        const credentialSchema = credential.credentialSchema.id

        const credentialRecord = {
          name,
          // summary: "", TODO: Get a summary somewhere
          schema: VAULT_SCHEMA_CREDENTIAL_BASE_0_2_0,
          credentialSchema,
          credentialData: credential,
        }

        return await credentialDatastore.save(credentialRecord)
      })
    )

    results.forEach((result) => {
      if (result.status === 'rejected') {
        logger.warn('Error while saving Polygon ID credential in Verida Vault')
        if (result.reason instanceof Error) {
          throw result.reason
        }
      } else if (!result.value) {
        // Is there a better way to handle a save failure?
        // It really shouldn't happen unless the network fails
        // in the short time period between saving the credential
        // in the polygon ID library and then saving it here
        logger.warn('Error while saving Polygon ID credential in Verida Vault')
        throw new Error('Saving Polygon ID credential in Verida Vault failed')
      }
    })
  }
}
