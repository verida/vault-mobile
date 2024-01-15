import { ChainId } from 'caip'
import * as React from 'react'

import { ResourceParams } from '../@types'
import { getChainIdParamsFromResourceParams } from '../utils'

export function useChainIdForResourceParams({
  resource,
}: {
  readonly resource: ResourceParams
}): ChainId {
  return React.useMemo(
    () => new ChainId(getChainIdParamsFromResourceParams(resource)),
    [resource]
  )
}
