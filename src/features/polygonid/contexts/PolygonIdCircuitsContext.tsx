import { CircuitId, CircuitStorage } from '@0xpolygonid/js-sdk'
import { config } from 'config'
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Logger } from '~/features/telemetry'

import { REQUIRED_CIRCUIT_IDS } from '../constants'
import { usePolygonIdCircuitStates } from '../hooks'
import { CircuitStates } from '../types'
import {
  createCircuitStorage,
  downloadAndSaveCircuit,
  downloadAndSaveCircuits,
  initCircuitStorage,
} from '../utils'

const logger = Logger.create('PolygonId')

const circuitStorage = createCircuitStorage()

export type PolygonIdCircuitsContextType = {
  readonly circuitStorage: CircuitStorage
  readonly areAllCircuitsAvailable: boolean
  readonly areAnyCircuitsDownloading: boolean
  readonly areAnyCircuitsUnavailable: boolean
  readonly areAnyCircuitsInError: boolean
  readonly circuitStates: CircuitStates
  readonly downloadCircuit: (circuitId: CircuitId) => Promise<void>
  readonly downloadAllCircuits: () => Promise<void>
}

export const PolygonIdCircuitsContext =
  createContext<PolygonIdCircuitsContextType | null>(null)

export const PolygonIdCircuitsProvider: React.FC = (props) => {
  const { children } = props

  const initialisationRef = useRef(false)
  const [downloading, setDownloading] = useState(false)

  const {
    areAllCircuitsAvailable,
    areAnyCircuitsUnavailable,
    areAnyCircuitsDownloading,
    areAnyCircuitsInError,
    circuitStates,
    updateState,
  } = usePolygonIdCircuitStates(circuitStorage, REQUIRED_CIRCUIT_IDS)

  // Ensure all circuits are downloaded at startup
  useEffect(
    function initialiseCircuits() {
      if (!areAnyCircuitsUnavailable || initialisationRef.current) {
        return
      }

      initialisationRef.current = true
      initCircuitStorage(
        circuitStates,
        circuitStorage,
        config.polygonId.common.circuitsDownloadUrl,
        updateState
      )
        .catch((error: unknown) => {
          logger.error(
            new Error('There was an error initialising the circuit storage', {
              cause: error,
            })
          )
        })
        .finally(() => {
          initialisationRef.current = false
        })
    },
    [
      circuitStates,
      areAllCircuitsAvailable,
      areAnyCircuitsDownloading,
      areAnyCircuitsUnavailable,
      updateState,
    ]
  )

  const downloadCircuit = useCallback(
    async (circuitId: CircuitId) => {
      if (downloading) {
        // TODO: Not great as the caller doesn't know what's happening
        return
      }

      setDownloading(true)

      try {
        await downloadAndSaveCircuit(
          circuitId,
          circuitStorage,
          config.polygonId.common.circuitsDownloadUrl,
          updateState
        )
      } catch (error) {
        logger.error(error)
      } finally {
        setDownloading(false)
      }
    },
    [downloading, updateState]
  )

  const downloadAllCircuits = useCallback(async () => {
    if (downloading) {
      // TODO: Not great as the caller doesn't know what's happening
      return
    }

    setDownloading(true)

    try {
      await downloadAndSaveCircuits(
        Object.keys(circuitStates) as CircuitId[],
        circuitStorage,
        config.polygonId.common.circuitsDownloadUrl,
        updateState
      )
    } catch (error) {
      logger.error(error)
    } finally {
      setDownloading(false)
    }
  }, [downloading, circuitStates, updateState])

  const contextValue: PolygonIdCircuitsContextType = useMemo(
    () => ({
      circuitStorage,
      areAllCircuitsAvailable,
      areAnyCircuitsUnavailable,
      areAnyCircuitsDownloading,
      areAnyCircuitsInError,
      circuitStates,
      downloadCircuit,
      downloadAllCircuits,
    }),
    [
      areAllCircuitsAvailable,
      areAnyCircuitsUnavailable,
      areAnyCircuitsDownloading,
      areAnyCircuitsInError,
      circuitStates,
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
