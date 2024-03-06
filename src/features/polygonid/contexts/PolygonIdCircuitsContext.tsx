import { CircuitId, CircuitStorage } from '@0xpolygonid/js-sdk'
import { config } from 'config'
import React, { createContext, useCallback, useEffect, useMemo } from 'react'

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
  readonly circuitStates: CircuitStates
  readonly downloadCircuit: (circuitId: CircuitId) => Promise<void>
  readonly downloadAllCircuits: () => Promise<void>
}

export const PolygonIdCircuitsContext =
  createContext<PolygonIdCircuitsContextType | null>(null)

export const PolygonIdCircuitsProvider: React.FC = (props) => {
  const { children } = props

  const {
    areAllCircuitsAvailable,
    areAnyCircuitsDownloading,
    areAnyCircuitsUnavailable,
    circuitStates,
    updateState,
  } = usePolygonIdCircuitStates(circuitStorage, REQUIRED_CIRCUIT_IDS)

  // Ensure all circuits are downloaded at startup
  useEffect(() => {
    if (!areAnyCircuitsUnavailable) {
      return
    }
    // FIXME: If there's an error downloading a circuit, for any reason, the circuit state will be switch back to UNAVAILABLE, meaning this init will be triggered again, and again, and again...

    initCircuitStorage(
      circuitStates,
      circuitStorage,
      config.polygonId.common.circuitsDownloadUrl,
      updateState
    ).catch((error: unknown) => {
      logger.error(
        new Error('There was an error initialising the circuit storage', {
          cause: error,
        })
      )
    })
  }, [
    circuitStates,
    areAllCircuitsAvailable,
    areAnyCircuitsDownloading,
    areAnyCircuitsUnavailable,
    updateState,
  ])

  const downloadCircuit = useCallback(
    async (circuitId: CircuitId) => {
      await downloadAndSaveCircuit(
        circuitId,
        circuitStorage,
        config.polygonId.common.circuitsDownloadUrl,
        updateState
      )
    },
    [updateState]
  )

  const downloadAllCircuits = useCallback(async () => {
    await downloadAndSaveCircuits(
      Object.keys(circuitStates) as CircuitId[],
      circuitStorage,
      config.polygonId.common.circuitsDownloadUrl,
      updateState
    )
  }, [circuitStates, updateState])

  const contextValue: PolygonIdCircuitsContextType = useMemo(
    () => ({
      circuitStorage,
      areAllCircuitsAvailable,
      areAnyCircuitsDownloading,
      areAnyCircuitsUnavailable,
      circuitStates,
      downloadCircuit,
      downloadAllCircuits,
    }),
    [
      areAllCircuitsAvailable,
      areAnyCircuitsDownloading,
      areAnyCircuitsUnavailable,
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
