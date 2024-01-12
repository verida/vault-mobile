import { ChainId } from 'caip'
import { isSupportedCaipNamespace } from 'features/caip'

import {
  AggregateWalletBannerBalance,
  MinifiedBlockchainAccounts,
} from '../@types'
import { getChainIdParamsFromResourceParams } from './getChainIdParamsFromResourceParams'
import { getWalletAddressForChainId } from './tokens'

export function getMaybeFromAddressForResource({
  resource,
  selectedMinifiedAccounts,
}: {
  readonly resource: AggregateWalletBannerBalance['resource']
  readonly selectedMinifiedAccounts: MinifiedBlockchainAccounts
}) {
  const chainIdParams = getChainIdParamsFromResourceParams(resource)

  const { namespace } = chainIdParams

  const fromAddress = getWalletAddressForChainId(
    new ChainId(chainIdParams),
    selectedMinifiedAccounts
  )

  if (typeof fromAddress !== 'string' || !fromAddress.length) return undefined

  if (!isSupportedCaipNamespace(namespace)) return undefined

  return { fromAddress, namespace }
}

export function getFromAddressForResourceOrThrow({
  resource,
  selectedMinifiedAccounts,
}: {
  readonly resource: AggregateWalletBannerBalance['resource']
  readonly selectedMinifiedAccounts: MinifiedBlockchainAccounts
}) {
  const maybeResult = getMaybeFromAddressForResource({
    resource,
    selectedMinifiedAccounts,
  })

  if (!maybeResult)
    throw new Error(
      `Expected fromAddressForResource, encountered ${String(maybeResult)}.`
    )

  return maybeResult
}
