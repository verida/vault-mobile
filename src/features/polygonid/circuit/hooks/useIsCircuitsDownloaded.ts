import type { CircuitId } from '@0xpolygonid/js-sdk'

import { Stateful } from '../../@types'
import { CircuitSpecificDownloadStates } from '../@types'
import { useCircuitContext } from '../contexts'
import { isCircuitDownloaded } from '../utils'

// Defines whether all circuits in the array have been successfully cached
// to the local device.
export function useIsCircuitsDownloaded(
  circuitIds: readonly `${CircuitId}`[]
): Stateful<boolean> {
  const { circuitDownloadStates } = useCircuitContext()

  const result =
    'result' in circuitDownloadStates
      ? circuitDownloadStates.result
      : ({} as const)

  const circuitsOfInterest = Object.entries(result)
    .filter(([circuitId]) => circuitIds.includes(circuitId as `${CircuitId}`))
    .map(([, circuitSpecificDownloadStates]) => circuitSpecificDownloadStates)

  return {
    loading: false,
    result: circuitsOfInterest.every((circuitSpecificDownloadStates) =>
      isCircuitDownloaded(
        circuitSpecificDownloadStates as CircuitSpecificDownloadStates
      )
    ),
  }
}
