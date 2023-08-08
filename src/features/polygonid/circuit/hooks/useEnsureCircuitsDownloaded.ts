import type { CircuitId } from '@0xpolygonid/js-sdk'
import { Logger } from 'features/telemetry'
import * as React from 'react'

import { useDownloadCircuit } from './useDownloadCircuit'
import { useIsCircuitsDownloaded } from './useIsCircuitsDownloaded'

const logger = new Logger('Polygon ID')

export function useEnsureCircuitsDownloaded(
  maybeCircuitIds: readonly `${CircuitId}`[]
) {
  const { downloadCircuit } = useDownloadCircuit()

  // HACK: Here we should useDeepCompareMemo. Until then, NEVER change
  //       the length of maybeCircuitIds at runtime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const circuitIds = React.useMemo(() => maybeCircuitIds, [...maybeCircuitIds])

  const isCircuitsDownloaded = useIsCircuitsDownloaded(circuitIds)

  const { loading } = isCircuitsDownloaded

  const isCircuitsDownloadedResult =
    'result' in isCircuitsDownloaded && isCircuitsDownloaded.result

  React.useEffect(() => {
    // If we're loading or all the circuits are downloaded, don't attempt to download them.
    if (loading || isCircuitsDownloadedResult) return

    logger.info('Trying to download the circuits')

    Promise.all(
      circuitIds.map((circuitId) =>
        downloadCircuit({
          circuitId: circuitId as CircuitId,
        })
      )
      // eslint-disable-next-line no-console
    ).catch(console.error)
  }, [loading, isCircuitsDownloadedResult, downloadCircuit, circuitIds])

  return isCircuitsDownloaded
}
