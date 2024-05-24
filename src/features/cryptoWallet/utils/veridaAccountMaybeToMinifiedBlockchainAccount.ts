import { ethers } from 'ethers'

import {
  isSupportedBlockchainNamespace,
  SupportedBlockchainNamespace,
} from '~/features/blockchain'
import { Logger } from '~/features/telemetry'

import {
  CryptoWalletAccount,
  CryptoWalletAccountEip155,
  CryptoWalletAccountNear,
  LegacyCryptoWalletAccount,
} from '../types'

const logger = Logger.create('veridaAccountMaybeToMinifiedVeridaAccount')

const transformLegacyWalletAccountToEip155CryptoWalletAccount = (
  legacyCryptoWalletAccount: LegacyCryptoWalletAccount
): CryptoWalletAccountEip155 | undefined => {
  const { address, privateKey } = legacyCryptoWalletAccount

  if (typeof address !== 'string' || !ethers.utils.isAddress(address)) {
    throw new Error(`Expected Ethereum address, encountered "${address}".`)
  }

  // Ignore watched wallets.
  if (typeof privateKey !== 'string' || !privateKey.length) {
    return undefined
  }

  return {
    namespace: SupportedBlockchainNamespace.EIP_155,
    address,
    privateKey,
    derivationIndex: 0,
  }
}

const transformLegacyWalletAccountToNearCryptoWalletAccount = (
  legacyCryptoWalletAccount: LegacyCryptoWalletAccount
): CryptoWalletAccountNear | undefined => {
  const { address, privateKey } = legacyCryptoWalletAccount

  if (typeof address !== 'string' || !address.length) {
    throw new Error(
      `Expected non-empty string address, encountered "${String(address)}".`
    )
  }

  // Ignore watched wallets.
  if (typeof privateKey !== 'string' || !privateKey.length) {
    return undefined
  }

  return {
    namespace: SupportedBlockchainNamespace.NEAR,
    privateKey,
    address,
    derivationIndex: 0,
  }
}

export function transformLegacyWalletAccountToCryptoWalletAccount(
  legacyCryptoWalletAccount: LegacyCryptoWalletAccount
): CryptoWalletAccount | undefined {
  const { namespace } = legacyCryptoWalletAccount

  if (typeof namespace !== 'string' || !namespace) {
    throw new Error(
      `Expected non-empty string namespace, encountered "${namespace}".`
    )
  }

  if (namespace === SupportedBlockchainNamespace.EIP_155) {
    return transformLegacyWalletAccountToEip155CryptoWalletAccount(
      legacyCryptoWalletAccount
    )
  } else if (namespace === SupportedBlockchainNamespace.NEAR) {
    return transformLegacyWalletAccountToNearCryptoWalletAccount(
      legacyCryptoWalletAccount
    )
  }

  logger.warn(
    `[veridaAccountMaybeToMinifiedVeridaAccount]: Encountered unimplemented namespace, "${namespace}". (Supported?: ${isSupportedBlockchainNamespace(
      namespace
    )})`
  )

  return undefined
}
