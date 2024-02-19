import { CircuitId } from '@0xpolygonid/js-sdk'
import { config } from 'config'
import React, { createContext, useCallback, useEffect, useMemo } from 'react'

import { ALL_CIRCUIT_IDS } from '../constants'
import { usePolygonIdCircuitDownloadStates } from '../hooks'
import { CircuitDownloadStates } from '../types'
import {
  downloadCircuit as downloadOneCircuit,
  polygonIdLogger as logger,
} from '../utils'

export type PolygonIdCircuitsContextType = {
  readonly areCircuitsDownloaded: boolean
  readonly areCircuitsDownloading: boolean
  readonly circuitDownloadStates: CircuitDownloadStates
  readonly downloadCircuit: (circuitId: CircuitId) => Promise<void>
  readonly downloadAllCircuits: () => Promise<void>
}

export const PolygonIdCircuitsContext =
  createContext<PolygonIdCircuitsContextType | null>(null)

export const PolygonIdCircuitsProvider: React.FC = (props) => {
  const { children } = props

  const {
    areCircuitsDownloading,
    areCircuitsDownloaded,
    circuitDownloadStates,
    updateDownloadState,
  } = usePolygonIdCircuitDownloadStates()

  const downloadCircuit = useCallback(
    async (circuitId: CircuitId) => {
      await downloadOneCircuit(
        circuitId,
        config.polygonId.common.circuitsDownloadUrl,
        updateDownloadState
      )
    },
    [updateDownloadState]
  )

  const downloadAllCircuits = useCallback(async () => {
    await Promise.all(
      ALL_CIRCUIT_IDS.map((circuitId) =>
        downloadCircuit(circuitId as CircuitId)
      )
    )
  }, [downloadCircuit])

  // Ensure all circuits are downloaded at startup
  useEffect(() => {
    if (areCircuitsDownloading) {
      logger.debug('Circuits currently downloading')
      return
    }

    if (areCircuitsDownloaded) {
      // FIXME: Check 'useIsCircuitsDownloaded' as this can also happen at the start when the download hasn't started yet
      logger.debug('All the circuits are downloaded')
      return
    }

    logger.info('Trying to download all the circuits')
    downloadAllCircuits().catch((error: unknown) => {
      logger.error(
        new Error('There was an error downloading the circuits', {
          cause: error,
        })
      )
    })
  }, [areCircuitsDownloading, areCircuitsDownloaded, downloadAllCircuits])

  const contextValue: PolygonIdCircuitsContextType = useMemo(
    () => ({
      areCircuitsDownloaded,
      areCircuitsDownloading,
      circuitDownloadStates,
      downloadCircuit,
      downloadAllCircuits,
    }),
    [
      areCircuitsDownloaded,
      areCircuitsDownloading,
      circuitDownloadStates,
      downloadCircuit,
      downloadAllCircuits,
    ]
  )

  return (
    <PolygonIdCircuitsContext.Provider value={contextValue}>
      {children}
    </PolygonIdCircuitsContext.Provider>
  )
}
