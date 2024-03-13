import { CircuitId } from '@0xpolygonid/js-sdk'
import { Logger } from 'features/telemetry'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { CircuitStatus, UpdateStateCallback } from '../types'
import {
  areCircuitsAvailable,
  areCircuitsDownloading,
  areCircuitsUnavailable,
  getCircuitStates,
  getInitialCircuitStates,
  PolygonIdCircuitStorage,
} from '../utils'

const logger = Logger.create('PolygonId')

export function usePolygonIdCircuitStates(
  circuitStorage: PolygonIdCircuitStorage,
  requiredCircuitIds: CircuitId[]
) {
  const [circuitStates, setCircuitStates] = useState(
    getInitialCircuitStates(requiredCircuitIds)
  )

  useEffect(() => {
    const init = async () => {
      logger.debug('Initialising circuit states')
      try {
        const currentCircuitStates = getCircuitStates(
          requiredCircuitIds,
          circuitStorage
        )
        setCircuitStates(currentCircuitStates)
      } catch (cause) {
        logger.error(
          new Error('Failed to determine the initial circuit states', {
            cause,
          })
        )
      }
    }
    init()
  }, [circuitStorage, requiredCircuitIds])

  const updateState: UpdateStateCallback = useCallback(
    (circuitId: CircuitId, status: CircuitStatus) => {
      logger.debug(`Updating state for circuit ${circuitId} to ${status}`)
      setCircuitStates((prevStates) => {
        return {
          ...prevStates,
          [circuitId]: {
            status: status,
          },
        }
      })
    },
    []
  )

  const areAnyCircuitsDownloading = areCircuitsDownloading(circuitStates)
  const areAllCircuitsAvailable = areCircuitsAvailable(circuitStates)
  const areAnyCircuitsUnavailable = areCircuitsUnavailable(circuitStates)

  return useMemo(
    () => ({
      circuitStates,
      areAnyCircuitsDownloading,
      areAllCircuitsAvailable,
      areAnyCircuitsUnavailable,
      updateState,
    }),
    [
      circuitStates,
      areAnyCircuitsDownloading,
      areAllCircuitsAvailable,
      areAnyCircuitsUnavailable,
      updateState,
    ]
  )
}
