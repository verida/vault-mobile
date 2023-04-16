import EncryptionUtils from '@verida/encryption-utils'
import {
  buildVeridaUri,
  explodeDID,
  explodeVeridaUri,
  wrapUri,
} from '@verida/helpers'
import {
  DatabasePermissionOptionsEnum,
  EnvironmentType,
  IContext,
  IDatastore,
  Web3CallType,
} from '@verida/types'
import { VeridaSBTClient } from '@verida/vda-sbt-client'
import { Credentials } from '@verida/verifiable-credentials'
import _ from 'lodash'

import CONFIG from '../config/environment'
import AccountManager from './AccountManager'
import { Account } from './types'

const SCHEMA_SBT =
  'https://common.schemas.verida.io/token/sbt/storage/v0.1.0/schema.json'
const SCHEMA_CREDENTIALS =
  'https://common.schemas.verida.io/credential/base/v0.2.0/schema.json'

export class SBTManager {
  private client?: VeridaSBTClient

  /**
   * Save a SBT credential
   *
   * @param id
   * @param credential
   * @param forceUpdate
   */
  public async saveCredential(id: string, credential: any) {
    console.log('saveCredential()')
    const context = <IContext>(
      await AccountManager.getInstance().getVeridaContext()
    )

    // Open the datastore
    const datastore = await context.openDatastore(SCHEMA_CREDENTIALS, {})
    const credentialRecord = {
      _id: id,
      ...credential,
    }

    // Try to fetch an existing record
    let existingRecord
    try {
      existingRecord = await datastore.get(id, {})

      // Record exists,
      const { _rev } = existingRecord

      if (
        !_.isEqual(
          existingRecord.credentialData,
          credentialRecord.credentialData
        )
      ) {
        // Data has changed, need to update
        // Set the existing record revision so update process correctly
        credentialRecord._rev = _rev

        // Data that changed
        //const changes = _.differenceWith(_.toPairs(existingRecord.credentialData), _.toPairs(credentialRecord.credentialData), _.isEqual)
        //console.log(changes)

        // Save the credential record
        if (!(await datastore.save(credentialRecord, {}))) {
          console.log('Invalid SBT credential', datastore.errors)
        }
      }
    } catch (err) {
      // Record doesn't exist, create it
      await datastore.save(credentialRecord, {
        forceInsert: true,
      })
    }
  }

  public async burnSbt(
    credentialRecord: any,
    mintAddress: string
  ): Promise<boolean> {
    mintAddress = mintAddress.toLowerCase()
    const context = <IContext>(
      await AccountManager.getInstance().getVeridaContext()
    )

    // Open the datastore
    const datastore = await context.openDatastore(SCHEMA_SBT, {
      permissions: {
        read: DatabasePermissionOptionsEnum.PUBLIC,
        write: DatabasePermissionOptionsEnum.OWNER,
      },
    })

    // Get the minted SBT
    const sbtId = `${mintAddress}-${credentialRecord._id}`
    let sbtRecord
    try {
      sbtRecord = await datastore.get(sbtId, {})
    } catch (err) {
      // doesn't exist
      throw new Error(`SBT hasn't been minted`)
    }

    // Delete the minted SBT from the public database
    //await datastore.delete(sbtId)

    // Unmint the SBT
    const client = await this.getClient()

    /*try {
      const claimedSbts = await client.getClaimedSBTList(mintAddress.toLowerCase())
      console.log(claimedSbts)
    } catch (err) {
      console.log(err.message)
    }*/
    try {
      const response = await client.burnSBT(59)
      console.log('burnt', response)
    } catch (err) {
      console.log('burn error')
      console.log(err.message)
      return false
    }
  }

  /**
   * Mint a SBT
   *
   * @param credentialRecord
   * @param mintAddress
   */
  public async mintSbt(
    credentialRecord: any,
    mintAddress: string
  ): Promise<boolean> {
    mintAddress = mintAddress.toLowerCase()
    // @todo: check it hasn't been minted already
    console.log(credentialRecord, mintAddress)
    //return

    const context = <IContext>(
      await AccountManager.getInstance().getVeridaContext()
    )

    // Open the datastore
    const datastore = await context.openDatastore(SCHEMA_SBT, {
      permissions: {
        read: DatabasePermissionOptionsEnum.PUBLIC,
        write: DatabasePermissionOptionsEnum.OWNER,
      },
    })

    // Check this SBT hasn't already been minted
    const sbtId = `${mintAddress}-${credentialRecord._id}`
    try {
      await datastore.get(sbtId, {})
      console.log('already exists', sbtId)
      // exists
      return false
    } catch (err) {
      // doesn't exist
    }

    // Save this SBT
    const sbtData: any = {
      _id: sbtId,
      ...credentialRecord.credentialData,
      didJwtVc: credentialRecord.didJwtVc,
    }

    console.log('sbtData', sbtData)

    const result: any = await datastore.save(sbtData, {
      forceInsert: true,
    })
    console.log(result)
    console.log(datastore.errors)
    const db = await datastore.getDb()
    const info = await db.info()
    const credentialUri = buildVeridaUri(
      await context.getAccount().did(),
      context.getContextName(),
      info.databaseName,
      sbtId,
      []
    )
    console.log(credentialUri)

    //const credentialUri = 'verida://did:vda:testnet:0xcD61d79C7db8fF5F80feCacEc0aE57274F5D6dF5/Verida%20Testing:%20Fake%20Vault/token_metadata_public/5d99c6e0-d38a-11ed-8135-f5f9ab7f39c3'

    // Fetch credential record from the network
    /*const credentialRecord = await fetchVeridaUri(
      credentialUri,
      context.getClient()
    )*/

    // Generate URL to mint that generates the metadata
    const sbtUri = wrapUri(credentialUri, 'https://data.verida.network')
    console.log('sbtUri', sbtUri)

    const credentials = new Credentials()

    //const sbtClient = await SbtController.getSbtClient()
    const generatedCredential = await credentials.verifyCredential(
      credentialRecord.didJwtVc,
      {}
    )
    //const sbtData = generatedCredential.verifiableCredential.credentialSubject
    const proofs = generatedCredential.payload.vc.proofs
    const vcIssuerDid = generatedCredential.payload.iss

    // Get the context proof of the issuer
    // (Links their DID to the signing key of the context that signed the credential proof)
    // @ts-ignore
    const didClient = context.getClient().didClient
    const issuerDidDoc = await didClient.get(vcIssuerDid)
    const issuerContextProof = issuerDidDoc.locateContextProof(
      generatedCredential.payload.vc.veridaContextName
    )

    console.log('issuerDid', vcIssuerDid)
    console.log('issuerContextProof', issuerContextProof)
    const { did } = explodeVeridaUri(credentialUri)
    console.log('subject did', did)
    const { address } = explodeDID(did)
    const proofString = `${sbtData.type}-${
      sbtData.uniqueAttribute
    }-${address.toLowerCase()}`
    console.log('proof string', proofString)
    console.log(proofs['type-unique-didAddress'])

    const signingAddress = EncryptionUtils.getSigner(
      proofString,
      proofs['type-unique-didAddress']
    )
    console.log('address that signed SBT string (issuer)', signingAddress)

    /*
    const issuerDidAddress = '0xB3d245bC0Fa8479b1B0b200c26f8c93e4737efC3'
    const requestProofMsg = `${issuerDidAddress}${signingAddress}`.toLowerCase()
    const privateKeyArray = new Uint8Array(
      Buffer.from(serverconfig.testing.veridaPrivateKey.slice(2), 'hex')
    )*/
    //const testSign = EncryptionUtils.signData(requestProofMsg, privateKeyArray)
    /*const signerContextSigner = EncryptionUtils.getSigner(
      requestProofMsg,
      issuerContextProof
    )
    console.log(
      'requestProofMsg (issuer signing context text)',
      requestProofMsg
    )
    console.log(
      'signerContextSigner (issuer signing context proof)',
      signerContextSigner
    )*/
    /*console.log('test sign', testSign)

            console.log('these two should match')
            console.log(testSign, issuerContextProof)

            const keyring = await connection.account.keyring(generatedCredential.payload.vc.veridaContextName)

            // Get keyring keys so public keys and ownership proof can be saved to the DID document
            const keys = await keyring.getKeys()
            console.log(keys)

            // Generate a proof that the DID controls the context public signing key that can be used on chain
            const proofStringReal = `${issuerDidAddress}${keys.signPublicAddress}`.toLowerCase()
            console.log('real proof string', proofStringReal)

            const signer2 = EncryptionUtils.getSigner(proofStringReal, issuerContextProof)
            console.log('signer2', signer2)*/

    //return

    // Initiate a SBT claim on-chain

    try {
      const client = await this.getClient()
      const mintResult = await client.claimSBT(
        sbtData.type,
        sbtData.uniqueAttribute,
        sbtUri,
        mintAddress,
        proofs['type-unique-didAddress'],
        issuerContextProof
      )

      console.log('mint result')
      console.log(mintResult)
      return true
    } catch (err) {
      console.log('mint error!')
      console.log(err.message)
      console.log(err.reason)
    }
  }

  private async getClient() {
    if (this.client) {
      return this.client
    }

    const didClientConfig = CONFIG.VERIDA_DID_CLIENT_CONFIG
    const account = <Account>(
      await AccountManager.getInstance().getSelectedAccount()
    )

    const sbtClient = new VeridaSBTClient({
      callType: <Web3CallType>didClientConfig.callType,
      did: account.did,
      signKey: account.privateKey,
      network: <EnvironmentType>CONFIG.ENVIRONMENT,
      web3Options: didClientConfig.web3Config,
    })

    this.client = sbtClient
    return this.client
  }
}
