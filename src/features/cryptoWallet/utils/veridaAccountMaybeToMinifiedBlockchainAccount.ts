import { ChainId } from 'caip'
import { ethers } from 'ethers'

import { SupportedBlockchainNamespace } from '~/features/blockchain'
import { isSupportedCaipNamespace } from '~/features/caip'
import { Logger } from '~/features/telemetry'

import {
  BlockchainAccount,
  MinifiedBlockchainAccount,
  MinifiedBlockchainAccountEip155,
  MinifiedBlockchainAccountNear,
} from '../types'

const logger = Logger.create('veridaAccountMaybeToMinifiedVeridaAccount')

const veridaAccountToMinifiedBlockchainAccountEip155 = (
  blockchainAccount: BlockchainAccount
): MinifiedBlockchainAccountEip155 | undefined => {
  const { address, privateKey } = blockchainAccount

  if (typeof address !== 'string' || !ethers.utils.isAddress(address))
    throw new Error(`Expected Ethereum address, encountered "${address}".`)

  // Ignore watched wallets.
  if (typeof privateKey !== 'string' || !privateKey.length) return undefined

  return {
    namespace: SupportedBlockchainNamespace.EIP_155,
    address,
    privateKey,
  }
}

const veridaAccountToMinifiedBlockchainAccountNear = ({
  address: signerId,
  privateKey,
}: BlockchainAccount): MinifiedBlockchainAccountNear | undefined => {
  if (typeof signerId !== 'string' || !signerId.length)
    throw new Error(
      `Expected non-empty string signerId, encountered "${String(signerId)}".`
    )

  // Ignore watched wallets.
  if (typeof privateKey !== 'string' || !privateKey.length) return undefined

  return {
    namespace: SupportedBlockchainNamespace.NEAR,
    privateKey,
    address: signerId,
  }
}

export function veridaAccountMaybeToMinifiedBlockchainAccount(
  blockchainAccount: BlockchainAccount
): MinifiedBlockchainAccount | undefined {
  const { chainId } = blockchainAccount

  if (typeof chainId !== 'string' || !chainId.length)
    throw new Error(
      `Expected non-empty string chainId, encountered "${chainId}".`
    )

  const { namespace } = new ChainId(chainId)

  if (namespace === SupportedBlockchainNamespace.EIP_155) {
    return veridaAccountToMinifiedBlockchainAccountEip155(blockchainAccount)
  } else if (namespace === SupportedBlockchainNamespace.NEAR) {
    return veridaAccountToMinifiedBlockchainAccountNear(blockchainAccount)
  }

  logger.warn(
    `[veridaAccountMaybeToMinifiedVeridaAccount]: Encountered unimplemented namespace, "${namespace}". (Supported?: ${isSupportedCaipNamespace(
      namespace
    )})`
  )

  return undefined
}
