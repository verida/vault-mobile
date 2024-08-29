import { AccountNodeDIDClientConfig, Network } from '@verida/types'

import { config } from '~/config'
import {
  VERIDA_VAULT_CONTEXT_NAME,
  VERIDA_WALLET_USER_AGENT,
} from '~/constants/application'
import { VERIDA_DID_REGEXP } from '~/features/verida'

/**
 * Check if a string value is a valid Verida DID.
 *
 * @param maybeDid The DID or value to test.
 * @returns `true` if a valid Verida DID, `false` otherwise.
 */
export function isValidVeridaDid(maybeDid: string) {
  return VERIDA_DID_REGEXP.test(maybeDid)
}

export function getDidClientConfigForNetwork(
  network: Network
): AccountNodeDIDClientConfig {
  const rpcUrl = config.verida[network].rpcUrl
  const metaTransactionServerUrl =
    config.verida[network].metaTransactionServerUrl

  return {
    callType: 'gasless',
    web3Config: {
      // TODO: Apparently the `callType` property doesn't exist on web3Config, to double check.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      callType: 'gasless',
      rpcUrl,
      serverConfig: {
        headers: {
          'context-name': VERIDA_VAULT_CONTEXT_NAME,
        },
      },
      postConfig: {
        headers: {
          'user-agent': VERIDA_WALLET_USER_AGENT,
        },
      },
      endpointUrl: metaTransactionServerUrl,
    },
    rpcUrl,
  }
}

/**
 * Returns the list of supported Verida networks. Takes into account the dev mode and feature flags.
 *
 * @returns An array of supported Verida networks.
 */
export function getSupportedVeridaNetworks(): Network[] {
  const networks: Network[] = []

  networks.push(Network.MYRTLE) // Main net
  networks.push(Network.BANKSIA)

  if (config.dev.devMode) {
    networks.push(Network.DEVNET)
    networks.push(Network.LOCAL)
  }
  return networks
}

export function getDefaultVeridaNetwork(): Network {
  return config.dev.devMode ? Network.BANKSIA : Network.MYRTLE
}
