import { ChainId } from 'caip'
import { ethers } from 'ethers'
import { SupportedBlockchainNamespace } from 'features/blockchain/@types/enums'
import { isSupportedCaipNamespace } from 'features/caip'

import { BlockchainAccount } from 'api/types'

import {
  MinifiedVeridaAccount,
  MinifiedVeridaAccountEip155,
  MinifiedVeridaAccountNear,
} from '../@types'

const veridaAccountToMinifiedVeridaAccountEip155 = (
  blockchainAccount: BlockchainAccount
): MinifiedVeridaAccountEip155 => {
  const { address, privateKey } = blockchainAccount

  if (typeof address !== 'string' || !ethers.utils.isAddress(address))
    throw new Error(`Expected Ethereum address, encountered "${address}".`)

  if (typeof privateKey !== 'string' || !privateKey.length)
    throw new Error('Expected non-empty string privateKey.')

  return {
    namespace: SupportedBlockchainNamespace.EIP_155,
    address,
    privateKey,
  }
}

const veridaAccountToMinifiedVeridaAccountNear = ({
  address: signerId,
  privateKey,
}: BlockchainAccount): MinifiedVeridaAccountNear => {
  if (typeof signerId !== 'string' || !signerId.length)
    throw new Error(
      `Expected non-empty string signerId, encountered "${String(signerId)}".`
    )

  if (typeof privateKey !== 'string' || !privateKey.length)
    throw new Error('Expected non-empty string privateKey.')

  return {
    namespace: SupportedBlockchainNamespace.NEAR,
    privateKey,
    address: signerId,
  }
}

export function veridaAccountMaybeToMinifiedVeridaAccount(
  blockchainAccount: BlockchainAccount
): MinifiedVeridaAccount | undefined {
  const { chainId } = blockchainAccount

  if (typeof chainId !== 'string' || !chainId.length)
    throw new Error(
      `Expected non-empty string chainId, encountered "${chainId}".`
    )

  const { namespace } = new ChainId(chainId)

  if (namespace === SupportedBlockchainNamespace.EIP_155) {
    return veridaAccountToMinifiedVeridaAccountEip155(blockchainAccount)
  } else if (namespace === SupportedBlockchainNamespace.NEAR) {
    return veridaAccountToMinifiedVeridaAccountNear(blockchainAccount)
  }

  __DEV__ &&
    // eslint-disable-next-line no-console
    console.warn(
      `[veridaAccountMaybeToMinifiedVeridaAccount]: Encountered unimplemented namespace, "${namespace}". (Supported?: ${isSupportedCaipNamespace(
        namespace
      )})`
    )
  return undefined
}
