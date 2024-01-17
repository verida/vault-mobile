import { buildVeridaUri, wrapUri } from '@verida/helpers'
import {
  DatabasePermissionOptionsEnum,
  EnvironmentType,
  Web3CallType,
} from '@verida/types'
import { SBTClientConfig, VeridaSBTClient } from '@verida/vda-sbt-client'
import { Credentials } from '@verida/verifiable-credentials'
import { config } from 'config'

import AccountManager from './AccountManager'

const SCHEMA_SBT =
  'https://common.schemas.verida.io/token/sbt/storage/v0.1.0/schema.json'

export class SBTMintManager {
  private sbtClient?: VeridaSBTClient

  public async mint(
    credentialRecord: any,
    mintAddress: string
    //type: string, uniqueAttribute: string, sbtUri: string, mintAddress: string, sbtProof: string
  ) {
    await this.init()

    const client = await AccountManager.getInstance().getClient()
    const account = await AccountManager.getInstance().getSelectedAccount()
    const context = await AccountManager.getInstance().getVeridaContext()
    const didClient = client!.didClient

    const did = await account!.did()

    const credentials = new Credentials()

    const generatedCredential = await credentials.verifyCredential(
      credentialRecord.didJwtVc,
      {}
    )
    const sbtData = generatedCredential.verifiableCredential.credentialSubject
    const proofs = generatedCredential.payload.vc.proofs
    const vcIssuerDid = generatedCredential.payload.iss

    const issuerDidDoc = await didClient.get(vcIssuerDid)
    const issuerContextProof = issuerDidDoc.locateContextProof(
      generatedCredential.payload.vc.veridaContextName
    )

    // Save the credentialRecord to public credential db
    const datastore = await context!.openDatastore(SCHEMA_SBT, {
      permissions: {
        read: DatabasePermissionOptionsEnum.PUBLIC,
        write: DatabasePermissionOptionsEnum.OWNER,
      },
    })

    const publicSbtData = {
      ...credentialRecord.credentialData,
      didJwtVc: credentialRecord.didJwtVc,
    }

    console.log('publicSbtData', publicSbtData)

    const result: any = await datastore.save(publicSbtData)
    const db = await datastore.getDb()
    const info = await db.info()

    const credentialUri = buildVeridaUri(
      did,
      context!.getContextName(),
      info.databaseName,
      result.id,
      []
    )
    const sbtUri = wrapUri(credentialUri)

    const claimResult = await this.sbtClient!.claimSBT(
      sbtData.type,
      sbtData.uniqueAttribute,
      sbtUri,
      mintAddress,
      proofs['type-unique-didAddress'],
      issuerContextProof!
    )
  }

  private async init() {
    if (this.sbtClient) {
      return
    }

    const didClientConfig = config.VERIDA_DID_CLIENT_CONFIG
    const account = await AccountManager.getInstance().getSelectedAccount()
    const did = await account!.did()

    const sbtClientConfig: SBTClientConfig = {
      callType: <Web3CallType>didClientConfig.callType,
      did,
      signKey: account!.privateKey,
      network: config.VERIDA_ENVIRONMENT,
      web3Options: didClientConfig.web3Config,
    }

    return new VeridaSBTClient(sbtClientConfig)
  }
}
