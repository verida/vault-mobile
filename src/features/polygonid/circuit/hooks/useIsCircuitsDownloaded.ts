import type { CircuitId } from '@0xpolygonid/js-sdk'
import { Logger } from 'features/telemetry'

import { Stateful } from '../../@types'
import { CircuitSpecificDownloadStates } from '../@types'
import { useCircuitContext } from '../contexts'
import { isCircuitDownloaded } from '../utils'

const logger = Logger.create('Polygon ID')

// Defines whether all circuits in the array have been successfully cached
// to the local device.
export function useIsCircuitsDownloaded(
  circuitIds: readonly `${CircuitId}`[]
): Stateful<boolean> {
  const { circuitDownloadStates } = useCircuitContext()

  if ('error' in circuitDownloadStates && circuitDownloadStates.error) {
    logger.error(
      new Error('Error downloading the circuits', {
        cause: circuitDownloadStates.error,
      })
    )
  }

  const result =
    'result' in circuitDownloadStates
      ? circuitDownloadStates.result
      : ({} as const)

  // TODO: Capture error in download state

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
    // FIXME: If there is no result above, then 'circuitsOfInterest' will be an empty array and 'every' return true even if nothing is downloaded. Fix is below but for some reason the error 'Was unable to ensure the existence of a /public directory' is thrown
    // result:
    //   circuitsOfInterest.length === circuitIds.length
    //     ? circuitsOfInterest.every((circuitSpecificDownloadStates) =>
    //         isCircuitDownloaded(
    //           circuitSpecificDownloadStates as CircuitSpecificDownloadStates
    //         )
    //       )
    //     : false,
  }
}
