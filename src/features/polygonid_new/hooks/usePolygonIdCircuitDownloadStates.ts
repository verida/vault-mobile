import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  CircuitDownloadStates,
  UpdateDownloadStateCallback,
  UpdateDownloadStateCallbackProps,
} from '../types'
import {
  areCircuitsDownloaded as areAllCircuitsDownloaded,
  areCircuitsDownloading as areAnyCircuitsDownloading,
  getCircuitDownloadStates,
  getUninitionalizedCircuitDownloadStates,
  polygonIdLogger as logger,
} from '../utils'

const uninitializedState = getUninitionalizedCircuitDownloadStates()

export function usePolygonIdCircuitDownloadStates() {
  const [initialCircuitDownloadStates, setInitialCircuitDownloadStates] =
    useState<CircuitDownloadStates>(uninitializedState)

  useEffect(() => {
    const init = async () => {
      try {
        const circuitDownloadStates = await getCircuitDownloadStates()
        setInitialCircuitDownloadStates(circuitDownloadStates)
      } catch (cause) {
        const error = new Error(
          'Failed to determine the initial circuit download states',
          {
            cause,
          }
        )
        logger.error(error)
      }
    }
    init()
  }, [])

  // Asserted download states can be written manually from the codebase at runtime; here, we
  // can update the current state of a download like progress.
  const [assertedCircuitDownloadStates, setAssertedCircuitDownloadStates] =
    useState<UpdateDownloadStateCallbackProps[]>([])

  const circuitDownloadStates = useMemo<CircuitDownloadStates>(() => {
    return Object.fromEntries(
      Object.entries(initialCircuitDownloadStates).map(
        ([circuitId, circuitSpecificDownloadStates]) => {
          // Find the matching asserted states for the current circuitType.
          const matchingAssertedDownloads =
            assertedCircuitDownloadStates.filter(
              ({ circuitId: id }) => id === circuitId
            )

          // Mix the asserted downloads with those signalled by the file system.
          // Asserted downloads take priority.
          return [
            circuitId,
            Object.fromEntries([
              // Filter out any circuits which have been asserted against.
              ...Object.entries(circuitSpecificDownloadStates),
              //.filter(([k]) => !assertedTypes.includes(k as CircuitType)),
              ...matchingAssertedDownloads.map(
                ({ circuitType, circuitComponentDownloadState }) => [
                  circuitType,
                  circuitComponentDownloadState,
                ]
              ),
            ]),
          ]
        }
      )
    ) as CircuitDownloadStates
  }, [initialCircuitDownloadStates, assertedCircuitDownloadStates])

  const areCircuitsDownloading = areAnyCircuitsDownloading(
    circuitDownloadStates
  )
  const areCircuitsDownloaded = areAllCircuitsDownloaded(circuitDownloadStates)

  // This is called by async tasks which which to update a download state, i.e. when a download
  // is updated. This allows us to mix runtime changes with the readings from the filesystem.
  const updateDownloadState: UpdateDownloadStateCallback = useCallback(
    ({
      circuitId,
      circuitType,
      circuitComponentDownloadState,
    }: UpdateDownloadStateCallbackProps) =>
      setAssertedCircuitDownloadStates(
        (currentlyAssertedCircuitDownloadStates) => [
          // Remove any old cached duplicates of the file-specific state.
          ...currentlyAssertedCircuitDownloadStates.filter(
            (maybeMatch) =>
              !(
                maybeMatch.circuitId === circuitId &&
                maybeMatch.circuitType === circuitType
              )
          ),
          // Append the latest state for the current circuit.
          { circuitId, circuitType, circuitComponentDownloadState },
        ]
      ),
    []
  )

  return {
    areCircuitsDownloading,
    areCircuitsDownloaded,
    circuitDownloadStates,
    updateDownloadState,
  }
}
