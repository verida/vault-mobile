import {
  AuthHandler,
  AuthorizationRequestMessage,
  CircuitId,
  CircuitStorage,
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

import { CalculateWitnessFunction, PolygonIdConfig } from '../types'
import { polygonIdLogger as logger } from './logger'
import {
  buildCredentialWallet,
  buildDataStorage,
  buildIdentityWallet,
  buildPackageManager,
  buildProofService,
  getOrCreatePolygonIdIdentity,
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
    circuitStorage: CircuitStorage,
    calculateWitness: CalculateWitnessFunction
  ): Promise<PolygonIdManager> {
    logger.info('Creating a Polygon Id Manager')
    try {
      // Pass the private key as needed, do not keep it as a class property
      const instance = new PolygonIdManager(config, veridaVaultContext)
      await instance.init(identityPrivatekey, circuitStorage, calculateWitness)

      logger.info('Polygon Id Manager created successfully')
      return instance
    } catch (error) {
      throw new Error(
        'Something went wrong when creating a Polygon ID Manager',
        {
          cause: error,
        }
      )
    }
  }

  private async init(
    identityPrivatekey: string,
    circuitStorage: CircuitStorage,
    calculateWitness: CalculateWitnessFunction
  ) {
    logger.info('Initialising a Polygon Id Manager')

    const ethConnectionConfig = defaultEthConnectionConfig
    ethConnectionConfig.contractAddress = this.config.polygonIdContractAddress
    ethConnectionConfig.url = this.config.polygonIdRpcUrl

    this.dataStorage = await buildDataStorage(
      this.veridaContext,
      ethConnectionConfig
    )

    this.credentialWallet = buildCredentialWallet(
      this.dataStorage,
      ethConnectionConfig
    )

    this.identityWallet = await buildIdentityWallet(
      this.veridaContext,
      this.dataStorage,
      this.credentialWallet
    )

    this.proofService = buildProofService(
      this.identityWallet,
      this.credentialWallet,
      circuitStorage,
      this.dataStorage.states,
      calculateWitness,
      this.config
    )

    this.packageManager = await buildPackageManager(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      this.proofService.generateAuthV2Inputs.bind(this.proofService),
      this.proofService.verifyState.bind(this.proofService),
      calculateWitness
    )

    logger.debug('Creating AuthHandler...')
    this.authHandler = new AuthHandler(this.packageManager, this.proofService)
    logger.info('AuthHandler created successfully')

    logger.debug('Creating FetchHandler...')
    this.fetchHandler = new FetchHandler(this.packageManager)
    logger.info('FetchHandler created successfully')

    this.did = await getOrCreatePolygonIdIdentity(
      this.identityWallet,
      this.dataStorage,
      this.config,
      identityPrivatekey
    )

    logger.info('Polygon Id Manager initialised')
  }

  private async handleAuthorizationRequest(
    message: AuthorizationRequestMessage
  ) {
    logger.info('Handling authorization request...')

    try {
      if (!this.authHandler) {
        throw new Error('Cannot handle request as AuthHandler is not ready')
      }

      if (!this.did) {
        throw new Error(
          'Cannot handle request as user Polygon ID identity is not ready'
        )
      }

      const encodedMessage = new TextEncoder().encode(JSON.stringify(message))

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
        throw new Error('Error calling authorization request callback', {
          cause: error,
        })
      }
    } catch (error) {
      logger.error(
        new Error('Failed to handle Polygon ID connection request', {
          cause: error,
        })
      )

      throw error
    }
  }

  private async handleCredentialsOffer(message: CredentialsOfferMessage) {
    logger.info('Handling credentials offer...')

    try {
      if (!this.fetchHandler) {
        throw new Error('Cannot handle offer as FetchHandler is not ready')
      }

      if (!this.credentialWallet) {
        throw new Error('Cannot handle offer as CredentialWallet is not ready')
      }

      const encodedData = new TextEncoder().encode(JSON.stringify(message))

      const credentials = await this.fetchHandler.handleCredentialOffer(
        encodedData
      )

      // TODO: Consider splitting this function in two, one to get the credentials from the offer, and another to save them. So the UI could see the credentials before they are saved

      logger.info('Saving the credentials in the Polygon ID credential wallet')
      await this.credentialWallet.saveAll(credentials)

      logger.info('Saving the credentials in the Verida Vault of the account')
      await this.saveCredentials(credentials)

      return credentials
    } catch (error) {
      logger.error(
        new Error('Failed to handle Polygon ID credential offer.', {
          cause: error,
        })
      )

      throw error
    }
  }

  public async processConnectionRequest(message: AuthorizationRequestMessage) {
    logger.info('Processing connection request...')
    try {
      const result = await this.handleAuthorizationRequest(message)
      return { result }
    } catch (cause) {
      return {
        error: new Error(
          // TODO: Adapt the error message to the type of error
          // The error message must be user-friendly, as it will be displayed in the UI
          'Something went wrong processing the Polygon ID connection request'
        ),
      }
    }
  }

  public async processProofRequest(message: AuthorizationRequestMessage) {
    logger.info('Processing proof request...')

    try {
      const result = await this.handleAuthorizationRequest(message)
      return { result }
    } catch (cause) {
      return {
        error: new Error(
          // TODO: Adapt the error message to the type of error
          // The error message must be user-friendly, as it will be displayed in the UI
          'Something went wrong processing the Polygon ID proof request'
        ),
      }
    }
  }

  public async processCredentialsOffer(message: CredentialsOfferMessage) {
    logger.info('Processing credential offer')

    try {
      const result = await this.handleCredentialsOffer(message)
      return { result }
    } catch (cause) {
      return {
        error: new Error(
          // TODO: Adapt the error message to the type of error
          // The error message must be user-friendly, as it will be displayed in the UI
          'Something went wrong processing the Polygon ID credential offer.'
        ),
      }
    }
  }

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
