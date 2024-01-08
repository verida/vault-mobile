import { Client } from '@verida/client-rn'
import { getNetworkFromDID } from 'features/identities'
import { Logger } from 'features/telemetry'
import { getDidClientConfigForNetwork, isValidVeridaDid } from 'features/verida'

import { VERIDA_VAULT_CONTEXT_NAME } from 'constants/application'

const logger = new Logger('Profiles')

export async function fetchPublicProfile(
  did: string,
  contextName = VERIDA_VAULT_CONTEXT_NAME,
  fallbackToVaultContext = true
) {
  if (!isValidVeridaDid(did)) {
    return // TODO: Throw an error instead?
  }

  try {
    const network = getNetworkFromDID(did)
    const defaultDidConfig = getDidClientConfigForNetwork(network)
    const client = new Client({
      environment: network,
      didClientConfig: {
        rpcUrl: defaultDidConfig.rpcUrl,
        network: network,
      },
    })

    return client.openPublicProfile(
      did,
      contextName,
      'basicProfile',
      fallbackToVaultContext ? VERIDA_VAULT_CONTEXT_NAME : undefined
    )
  } catch (error: unknown) {
    logger.warn(`Not able to fetch public profile of ${did}`)
    logger.error(error)
    return
  }
}

export * from './cache'
