import type { CircuitId } from '@0xpolygonid/js-sdk'
import * as React from 'react'
import RNBlobUtil from 'react-native-blob-util'

import { Stateful } from '../../@types'
import {
  CircuitDownloadState,
  CircuitDownloadStates,
  CircuitDownloadStatus,
  CircuitType,
} from '../@types'
import { ALL_CIRCUIT_IDS } from '../constants'
import { getCircuitFilePaths } from '../utils'

const loadingState = (): Stateful<CircuitDownloadStates> => ({
  loading: true,
})

export function useCreateCircuitDownloadStates({
  publicDir,
}: {
  readonly publicDir: string
}) {
  const [state, setState] =
    React.useState<Stateful<CircuitDownloadStates>>(loadingState)

  // Looks at the state of the file system to determine
  // which circuits are present.
  const fetch = React.useCallback(
    async () =>
      Object.fromEntries(
        await Promise.all(
          ALL_CIRCUIT_IDS.map(async (circuitId: string) => {
            const circuitFilePaths = getCircuitFilePaths({
              publicDir,
              circuitId: circuitId as `${CircuitId}`,
            })

            return [
              circuitId,
              Object.fromEntries(
                await Promise.all(
                  Object.keys(CircuitType).map((circuitType) =>
                    RNBlobUtil.fs
                      .exists(circuitFilePaths[circuitType as CircuitType])
                      .then(
                        (exists): CircuitDownloadState =>
                          exists
                            ? { status: CircuitDownloadStatus.DOWNLOADED }
                            : { status: CircuitDownloadStatus.UNINITIALIZED }
                      )
                      .then((circuitDownloadState) => [
                        circuitType as CircuitType,
                        circuitDownloadState,
                      ])
                  )
                )
              ),
            ]
          })
        )
      ) as CircuitDownloadStates,
    [publicDir]
  )

  React.useEffect(() => {
    const init = async () => {
      try {
        setState(loadingState)

        const circuitDownloadStates = await fetch()

        setState({ loading: false, result: circuitDownloadStates })
      } catch (cause) {
        setState({
          loading: false,
          error: new Error('Failed to determine CircuitDownloadStates.', {
            cause,
          }),
        })
      }
    }
    init()
  }, [fetch])

  return state
}
