import type { CircuitId } from '@0xpolygonid/js-sdk'
import { POLYGON_ID_CIRCUITS_DOWNLOAD_URL } from 'features/polygonid/constants'
import { Logger } from 'features/telemetry'
import * as React from 'react'
import RNBlobUtil from 'react-native-blob-util'

import {
  CircuitDownloadStatus,
  CircuitSpecificStrings,
  CircuitType,
} from '../@types'
import { useCircuitContext } from '../contexts'
import {
  getCircuitDir,
  getCircuitFilePaths,
  getCircuitRemoteUri,
  getCircuitsDir,
} from '../utils'

const logger = Logger.create('Polygon ID')

export function useDownloadCircuit({
  veridaBaseUri = POLYGON_ID_CIRCUITS_DOWNLOAD_URL,
}: {
  readonly veridaBaseUri?: string
} = {}) {
  // Base directory to save circuits.
  const { publicDir, assertDownloadState } = useCircuitContext()

  const downloadCircuit = React.useCallback(
    async ({
      circuitId,
    }: {
      readonly circuitId: `${CircuitId}`
    }): Promise<CircuitSpecificStrings> => {
      if (veridaBaseUri.endsWith('/'))
        throw new Error('Do not include a trailing slash in the veridaBaseUri!')

      const circuitRemoteUris = getCircuitRemoteUri({
        veridaBaseUri,
        circuitId,
      })

      const circuitsDir = getCircuitsDir({ publicDir })

      // If the circuits dir doesn't exist, create it.
      if (!(await RNBlobUtil.fs.exists(circuitsDir))) {
        await RNBlobUtil.fs.mkdir(circuitsDir).catch(() => {
          // race_condition
        })
      }

      // Create the circuitId-specific directory within the circuits dir where
      // we'll store these files.
      const targetDir = getCircuitDir({ publicDir, circuitId })

      // If the target dir doesn't exist, create it.
      if (!(await RNBlobUtil.fs.exists(targetDir))) {
        logger.info(`Creating the circuit dir for ${circuitId}`)
        await RNBlobUtil.fs.mkdir(targetDir).catch(() => {
          // race_condition
        })
      }

      const circuitFilePaths = getCircuitFilePaths({
        publicDir,
        circuitId,
      })

      await Promise.all(
        Object.entries(circuitRemoteUris).map(([circuitType, uri]) =>
          RNBlobUtil.fetch('GET', uri, {})
            .progress((receivedBytes, totalBytes) =>
              assertDownloadState({
                circuitId: circuitId as CircuitId,
                circuitType: circuitType as CircuitType,
                circuitDownloadState: {
                  status: CircuitDownloadStatus.DOWNLOADING,
                  receivedBytes,
                  totalBytes,
                },
              })
            )
            .then((result) => result.base64())
            .then((base64) => {
              const maybePath = circuitFilePaths[circuitType as CircuitType]

              if (!maybePath)
                throw new Error(
                  `Unable to determine circuitFilePath for "${circuitType}".`
                )

              return RNBlobUtil.fs.writeFile(maybePath, base64)
            })
        )
      )
      // No catch here, error will bubble to the upper level

      // Upon completion, ensure we mark that all downloads have completed.
      // The top level provider may have only initialized against the empty/partial
      // download filesystem.
      Object.keys(CircuitType).forEach((circuitType) =>
        assertDownloadState({
          circuitId: circuitId as CircuitId,
          circuitType: circuitType as CircuitType,
          circuitDownloadState: { status: CircuitDownloadStatus.DOWNLOADED },
        })
      )

      return circuitFilePaths
    },
    [veridaBaseUri, publicDir, assertDownloadState]
  )

  return { downloadCircuit }
}
