import { Logger } from 'features/telemetry'
import * as React from 'react'

import { Stateful } from '../../@types'
import {
  AssertDownloadStateCallback,
  AssertDownloadStateCallbackProps,
  CircuitDownloadStates,
} from '../@types'
import { useCreateCircuitDownloadStates } from './useCreateCircuitDownloadStates'

const logger = new Logger('Polygon ID')

export function useCreateEvaluatedCircuitDownloadStates({
  publicDir,
}: {
  readonly publicDir: string
}) {
  // These are the download states as asserted by reading the file system. If a file exists,
  // it is assumed downloaded. Else, uninitialized.
  const circuitDownloadStates = useCreateCircuitDownloadStates({ publicDir })

  if ('error' in circuitDownloadStates && circuitDownloadStates.error) {
    logger.error(circuitDownloadStates.error)
  }

  // Asserted download states can be written manually from the codebase at runtime; here, we
  // can update the current state of a download like progress.
  const [assertedCircuitDownloadStates, setAssertedCircuitDownloadStates] =
    React.useState<readonly AssertDownloadStateCallbackProps[]>([])

  // This is called by async tasks which which to update a download state, i.e. when a download
  // is updated. This allows us to mix runtime changes with the readings from the filesystem.
  const assertDownloadState: AssertDownloadStateCallback = React.useCallback(
    ({
      circuitId,
      circuitType,
      circuitDownloadState,
    }: AssertDownloadStateCallbackProps) =>
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
          { circuitId, circuitType, circuitDownloadState },
        ]
      ),
    []
  )

  const evaluatedCircuitDownloadStates = React.useMemo<
    Stateful<CircuitDownloadStates>
  >(() => {
    if (!('result' in circuitDownloadStates)) return circuitDownloadStates

    const { result, ...extras } = circuitDownloadStates

    const nextResult = Object.fromEntries(
      Object.entries(result).map(
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
                ({ circuitType, circuitDownloadState }) => [
                  circuitType,
                  circuitDownloadState,
                ]
              ),
            ]),
          ]
        }
      )
    ) as CircuitDownloadStates

    return { ...extras, result: nextResult }
  }, [circuitDownloadStates, assertedCircuitDownloadStates])

  return { evaluatedCircuitDownloadStates, assertDownloadState }
}
