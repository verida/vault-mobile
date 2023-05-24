import type { CircuitId } from '@0xpolygonid/js-sdk'
import * as React from 'react'

import { useDownloadCircuit } from './useDownloadCircuit'
import { useIsCircuitsDownloaded } from './useIsCircuitsDownloaded'

export function useEnsureCircuitsDownloaded(
  maybeCircuitIds: readonly `${CircuitId}`[]
) {
  const { downloadCircuit } = useDownloadCircuit()

  // HACK: Here we should useDeepCompareMemo. Until then, NEVER change
  //       the length of maybeCircuitIds at runtime.
  const circuitIds = React.useMemo(() => maybeCircuitIds, [...maybeCircuitIds])

  const isCircuitsDownloaded = useIsCircuitsDownloaded(circuitIds)

  const { loading } = isCircuitsDownloaded

  const isCircuitsDownloadedResult =
    'result' in isCircuitsDownloaded && isCircuitsDownloaded.result

  React.useEffect(() => {
    // If we're loading or all the circuits are downloaded, don't attempt to download them.
    if (loading || isCircuitsDownloadedResult) return

    console.warn('trying to install', Math.random())

    Promise.all(
      circuitIds.map((circuitId) =>
        downloadCircuit({
          circuitId: circuitId as CircuitId,
        })
      )
    ).catch(console.error)
  }, [loading, isCircuitsDownloadedResult, downloadCircuit, circuitIds])

  return isCircuitsDownloaded
}
