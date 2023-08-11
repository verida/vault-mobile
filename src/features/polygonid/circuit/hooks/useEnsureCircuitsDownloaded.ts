import type { CircuitId } from '@0xpolygonid/js-sdk'
import { POLYGON_ID_CIRCUITS_DOWNLOAD_URL } from 'features/polygonid'
import { Logger, Sentry } from 'features/telemetry'
import * as React from 'react'

import { useDownloadCircuit } from './useDownloadCircuit'
import { useIsCircuitsDownloaded } from './useIsCircuitsDownloaded'

const logger = new Logger('Polygon ID')

export function useEnsureCircuitsDownloaded(
  maybeCircuitIds: readonly `${CircuitId}`[]
) {
  const { downloadCircuit } = useDownloadCircuit({
    veridaBaseUri: POLYGON_ID_CIRCUITS_DOWNLOAD_URL, // TODO: Get from the configuration
  })

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
    if (loading) {
      // TODO: Is it really needed? Because 'loading' is hardcoded to 'false', never to true
      logger.debug('Circuits are downloading')
      return
    }
    if (isCircuitsDownloadedResult) {
      // FIXME: Check 'useIsCircuitsDownloaded' as this can also happen at the start when the download hasn't started yet
      logger.debug('All the circuits are downloaded')
      return
    }

    logger.info('Trying to download the circuits')

    Promise.all(
      circuitIds.map((circuitId) =>
        downloadCircuit({
          circuitId: circuitId as CircuitId,
        })
      )
    ).catch((error: unknown) => {
      logger.warn('There was an error downloading the circuits')
      Sentry.captureException(error)
    })
  }, [loading, isCircuitsDownloadedResult, downloadCircuit, circuitIds])

  return isCircuitsDownloaded
}
