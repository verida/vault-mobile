import { Client } from '@verida/client-rn'
import { getNetworkFromDID } from 'features/identities'
import { Logger } from 'features/telemetry'
import { getDidClientConfigForNetwork, isValidVeridaDid } from 'features/verida'

import { VERIDA_VAULT_CONTEXT_NAME } from 'constants/application'

import { PublicProfile } from '../types'

const logger = Logger.create('Profiles')

export async function getPublicProfileDatastore(
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

export async function getPublicProfile(
  did: string,
  contextName = VERIDA_VAULT_CONTEXT_NAME,
  fallbackToVaultContext = true
): Promise<PublicProfile> {
  try {
    const profileDb = await getPublicProfileDatastore(
      did,
      contextName,
      fallbackToVaultContext
    )

    if (!profileDb) {
      return {
        name: '',
      }
    }

    const [
      nameResult,
      avatarResult,
      descriptionResult,
      countryResult,
      websiteResult,
    ] = await Promise.allSettled([
      await profileDb.get('name'),
      await profileDb.get('avatar'),
      await profileDb.get('description'),
      await profileDb.get('country'),
      await profileDb.get('website'),
    ])

    return {
      name: nameResult.status === 'fulfilled' ? nameResult.value : '',
      avatar:
        avatarResult.status === 'fulfilled' ? avatarResult.value : undefined,
      description:
        descriptionResult.status === 'fulfilled'
          ? descriptionResult.value
          : undefined,
      country:
        countryResult.status === 'fulfilled' ? countryResult.value : undefined,
      website:
        websiteResult.status === 'fulfilled' ? websiteResult.value : undefined,
    }
  } catch (error) {
    logger.error(error)
    return {
      name: '',
    }
  }
}

export * from './cache'
