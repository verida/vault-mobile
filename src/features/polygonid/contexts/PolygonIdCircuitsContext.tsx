import { CircuitStorage } from '@0xpolygonid/js-sdk'
import { config } from 'config'
import { Logger } from 'features/telemetry'
import React, { createContext, useEffect, useMemo } from 'react'

import { REQUIRED_CIRCUIT_IDS } from '../constants'
import { usePolygonIdCircuitStates } from '../hooks'
import { CircuitStates } from '../types'
import { createCircuitStorage, initCircuitStorage } from '../utils'

const logger = Logger.create('PolygonId')

const circuitStorage = createCircuitStorage()

export type PolygonIdCircuitsContextType = {
  readonly circuitStorage: CircuitStorage
  readonly areAllCircuitsAvailable: boolean
  readonly areAnyCircuitsDownloading: boolean
  readonly areAnyCircuitsUnavailable: boolean
  readonly circuitStates: CircuitStates
  // TODO: Add a function to download a circuit
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

  const contextValue: PolygonIdCircuitsContextType = useMemo(
    () => ({
      circuitStorage,
      areAllCircuitsAvailable,
      areAnyCircuitsDownloading,
      areAnyCircuitsUnavailable,
      circuitStates,
    }),
    [
      areAllCircuitsAvailable,
      areAnyCircuitsDownloading,
      areAnyCircuitsUnavailable,
      circuitStates,
    ]
  )

  return (
    <PolygonIdCircuitsContext.Provider value={contextValue}>
      {children}
    </PolygonIdCircuitsContext.Provider>
  )
}
