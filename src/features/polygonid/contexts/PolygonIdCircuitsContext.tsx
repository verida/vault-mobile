import { CircuitId, CircuitStorage } from '@0xpolygonid/js-sdk'
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'

import { config } from '~/config'
import { Logger } from '~/features/telemetry'

import { REQUIRED_CIRCUIT_IDS } from '../constants'
import { usePolygonIdCircuitStates } from '../hooks'
import { CircuitStates, CircuitStatus } from '../types'
import { createCircuitStorage, downloadAndSaveCircuits } from '../utils'

const logger = Logger.create('PolygonId')

const circuitStorage = createCircuitStorage()

export type PolygonIdCircuitsContextType = {
  readonly circuitStorage: CircuitStorage
  readonly areAllCircuitsAvailable: boolean
  readonly areAnyCircuitsDownloading: boolean
  readonly areAnyCircuitsUnavailable: boolean
  readonly areAnyCircuitsInError: boolean
  readonly circuitStates: CircuitStates
  readonly downloadCircuits: (circuitIds?: CircuitId[]) => Promise<void>
}

export const PolygonIdCircuitsContext =
  createContext<PolygonIdCircuitsContextType | null>(null)

export const PolygonIdCircuitsProvider: React.FC = (props) => {
  const { children } = props

  const downloadingRef = useRef(false)

  const {
    areAllCircuitsAvailable,
    areAnyCircuitsUnavailable,
    areAnyCircuitsDownloading,
    areAnyCircuitsInError,
    circuitStates,
    updateState,
  } = usePolygonIdCircuitStates(circuitStorage, REQUIRED_CIRCUIT_IDS)

  const downloadCircuits = useCallback(
    async (circuitIds = REQUIRED_CIRCUIT_IDS) => {
      if (downloadingRef.current) {
        throw new Error('Circuits are already being downloaded')
      }

      downloadingRef.current = true

      try {
        await downloadAndSaveCircuits(
          circuitIds,
          circuitStorage,
          config.polygonId.common.circuitsDownloadUrl,
          updateState
        )
      } catch (error) {
        logger.error(error)
      } finally {
        downloadingRef.current = false
      }
    },
    [updateState]
  )

  // Ensure all circuits are downloaded at startup
  useEffect(
    function initialiseCircuits() {
      if (!areAnyCircuitsUnavailable) {
        // Ciruits already downloaded
        return
      }
      if (downloadingRef.current) {
        // Circuits are already being downloaded
        return
      }

      const unavailableCircuits = Object.entries(circuitStates)
        .filter(
          ([, circuitState]) =>
            circuitState.status === CircuitStatus.UNAVAILABLE
        )
        .map(([circuitId]) => circuitId as CircuitId)

      if (unavailableCircuits.length === 0) {
        // Should not happen with the condition above: !areAnyCircuitsUnavailable
        logger.info('All required circuits are available')
        return
      }

      logger.info('Downloading missing circuits...')

      downloadCircuits(unavailableCircuits)
        .then(() => {
          logger.info('Circuits downloaded')
        })
        .catch((error: unknown) => {
          logger.error(
            new Error('There was an error downloading the circuits', {
              cause: error,
            })
          )
        })
    },
    [
      circuitStates,
      downloadCircuits,
      areAllCircuitsAvailable,
      areAnyCircuitsDownloading,
      areAnyCircuitsUnavailable,
      updateState,
    ]
  )

  const contextValue: PolygonIdCircuitsContextType = useMemo(
    () => ({
      circuitStorage,
      areAllCircuitsAvailable,
      areAnyCircuitsUnavailable,
      areAnyCircuitsDownloading,
      areAnyCircuitsInError,
      circuitStates,
      downloadCircuits,
    }),
    [
      areAllCircuitsAvailable,
      areAnyCircuitsUnavailable,
      areAnyCircuitsDownloading,
      areAnyCircuitsInError,
      circuitStates,
      downloadCircuits,
    ]
  )

  return (
    <PolygonIdCircuitsContext.Provider value={contextValue}>
      {children}
    </PolygonIdCircuitsContext.Provider>
  )
}
