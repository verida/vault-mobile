import { EnvironmentType, IAccount } from '@verida/types'
import { SBTClientConfig, VeridaSBTClient } from '@verida/vda-sbt-client'

import CONFIG from '../config/environment'

export class SBTManager {
  public async init(account: IAccount): Promise<VeridaSBTClient> {
    const did = await account.did()

    const config: SBTClientConfig = {
      callType: <Web3CallType>CONFIG.VERIDA_DID_CLIENT_CONFIG.callType,
      did,
      signKey: account.keyring,
      network: <EnvironmentType>CONFIG.ENVIRONMENT,
      web3Options: CONFIG.VERIDA_DID_CLIENT_CONFIG.web3Config,
    }

    return new VeridaSBTClient(config)
  }
}
