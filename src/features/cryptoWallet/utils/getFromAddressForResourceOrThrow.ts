import { ChainId } from 'caip'
import { isSupportedCaipNamespace } from 'features/caip'

import { AggregateWalletBannerBalance, MinifiedVeridaAccounts } from '../@types'
import { getChainIdParamsFromResourceParams } from './getChainIdParamsFromResourceParams'
import { getWalletAddressForChainId } from './tokens'

export function getFromAddressForResourceOrThrow({
  resource,
  selectedMinifiedAccounts,
}: {
  readonly resource: AggregateWalletBannerBalance['resource']
  readonly selectedMinifiedAccounts: MinifiedVeridaAccounts
}) {
  const chainIdParams = getChainIdParamsFromResourceParams(resource)

  const { namespace } = chainIdParams

  const fromAddress = getWalletAddressForChainId(
    new ChainId(chainIdParams),
    selectedMinifiedAccounts
  )

  if (typeof fromAddress !== 'string' || !fromAddress.length)
    throw new Error(
      `Expected non-empty string fromAddress, encountered "${fromAddress}".`
    )

  if (!isSupportedCaipNamespace(namespace))
    throw new Error(`Sorry, "${namespace}" is not a supported namespace.`)

  return { fromAddress, namespace }
}
