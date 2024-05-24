import { ChainId } from 'caip'

import { isSupportedBlockchainNamespace } from '~/features/blockchain'

import { AggregateWalletBannerBalance, CryptoWalletAccounts } from '../types'
import { getChainIdParamsFromResourceParams } from './getChainIdParamsFromResourceParams'
import { getWalletAddressForChainId } from './tokens'

export function getMaybeFromAddressForResource({
  resource,
  selectedMinifiedAccounts,
}: {
  readonly resource: AggregateWalletBannerBalance['resource']
  readonly selectedMinifiedAccounts: CryptoWalletAccounts
}) {
  const chainIdParams = getChainIdParamsFromResourceParams(resource)

  const { namespace } = chainIdParams

  const fromAddress = getWalletAddressForChainId(
    new ChainId(chainIdParams),
    selectedMinifiedAccounts
  )

  if (typeof fromAddress !== 'string' || !fromAddress.length) {
    return undefined
  }

  if (!isSupportedBlockchainNamespace(namespace)) {
    return undefined
  }

  return { fromAddress, namespace }
}

export function getFromAddressForResourceOrThrow({
  resource,
  selectedMinifiedAccounts,
}: {
  readonly resource: AggregateWalletBannerBalance['resource']
  readonly selectedMinifiedAccounts: CryptoWalletAccounts
}) {
  const maybeResult = getMaybeFromAddressForResource({
    resource,
    selectedMinifiedAccounts,
  })

  if (!maybeResult) {
    throw new Error(
      `Expected fromAddressForResource, encountered ${String(maybeResult)}.`
    )
  }

  return maybeResult
}
