import { ChainId, ChainIdParams } from 'caip'

import { isChainIdResourceParams, ResourceParams } from '../@types'

export function getChainIdParamsFromResourceParams(
  resourceParams: ResourceParams
): ChainIdParams {
  if (isChainIdResourceParams(resourceParams)) return resourceParams

  // NOTE: The caip spec indicates we can use either a string identifier
  //       or ChainIdParams to construct AssetIdParams. Here, we normalize
  //       into ChainIdParams.
  const { reference, namespace } = new ChainId(resourceParams.chainId)
  return { reference, namespace }
}
