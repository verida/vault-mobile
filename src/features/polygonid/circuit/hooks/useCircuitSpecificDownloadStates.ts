import type { CircuitId } from '@0xpolygonid/js-sdk'

import { Stateful } from '../../@types'
import { CircuitSpecificDownloadStates } from '../@types'
import { useCircuitContext } from '../contexts'

export function useCircuitSpecificDownloadStates({
  circuitId,
}: {
  readonly circuitId: `${CircuitId}`
}): Stateful<CircuitSpecificDownloadStates> {
  const { circuitDownloadStates } = useCircuitContext()

  if (!('result' in circuitDownloadStates)) return circuitDownloadStates

  const { result } = circuitDownloadStates

  const { [circuitId]: circuitSpecificDownloadStates } = result

  return { loading: false, result: circuitSpecificDownloadStates }
}
