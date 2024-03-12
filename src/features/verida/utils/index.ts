import { AccountNodeDIDClientConfig, EnvironmentType } from '@verida/types'
import { config } from 'config'
import { VERIDA_DID_REGEXP } from 'features/verida'

import {
  VERIDA_VAULT_CONTEXT_NAME,
  VERIDA_WALLET_USER_AGENT,
} from 'constants/application'

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
  network: EnvironmentType
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
export function getSupportedVeridaNetworks(): EnvironmentType[] {
  const networks: EnvironmentType[] = []
  if (config.features.veridaMainnet.enabled) {
    networks.push(EnvironmentType.MAINNET)
  }

  networks.push(EnvironmentType.TESTNET)

  if (config.dev.devMode) {
    networks.push(EnvironmentType.DEVNET)
    networks.push(EnvironmentType.LOCAL)
  }
  return networks
}

export function getDefaultVeridaNetwork(): EnvironmentType {
  return config.dev.devMode
    ? EnvironmentType.DEVNET
    : config.features.veridaMainnet.enabled
      ? EnvironmentType.MAINNET
      : EnvironmentType.TESTNET
}
