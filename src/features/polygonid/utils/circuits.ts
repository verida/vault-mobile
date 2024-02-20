import {
  CircuitData,
  CircuitId,
  CircuitStorage,
  InMemoryDataSource,
} from '@0xpolygonid/js-sdk'
import RNBlobUtil from 'react-native-blob-util'

import { ALL_CIRCUIT_IDS, POLYGONID_CIRCUITS_DIR } from '../constants'
import {
  CircuitComponentDownloadState,
  CircuitComponentDownloadStatus,
  CircuitComponentPaths,
  CircuitComponentType,
  CircuitDownloadState,
  CircuitDownloadStates,
  UpdateDownloadStateCallback,
} from '../types'
import { polygonIdLogger as logger } from './logger'

export async function createCircuitsDir() {
  if (!(await RNBlobUtil.fs.exists(POLYGONID_CIRCUITS_DIR))) {
    logger.info(`Creating the circuits directory`)
    await RNBlobUtil.fs.mkdir(POLYGONID_CIRCUITS_DIR).catch(() => {
      // race condition
    })
  }
}

export async function createCircuitDir(circuitId: `${CircuitId}`) {
  const targetDir = getCircuitDir(circuitId)

  if (!(await RNBlobUtil.fs.exists(targetDir))) {
    logger.info(`Creating the circuit directory for ${circuitId}`)
    await RNBlobUtil.fs.mkdir(targetDir).catch(() => {
      // race condition
    })
  }
}

export function getCircuitDir(circuitId: `${CircuitId}`) {
  return `${POLYGONID_CIRCUITS_DIR}/${circuitId}`
}

export function getCircuitFilePaths(
  circuitId: `${CircuitId}`
): CircuitComponentPaths {
  const parent = getCircuitDir(circuitId)

  const verificationKeyPath = `${parent}/verification_key.base64`
  const provingKeyPath = `${parent}/circuit_final.base64`
  const wasmPath = `${parent}/wasm.base64`

  return {
    [CircuitComponentType.VERIFICATION_KEY]: verificationKeyPath,
    [CircuitComponentType.PROVING_KEY]: provingKeyPath,
    [CircuitComponentType.WASM]: wasmPath,
  }
}

export function getCircuitRemoteUri({
  circuitId,
  veridaBaseUri,
}: {
  readonly circuitId: `${CircuitId}`
  readonly veridaBaseUri: string
}): CircuitComponentPaths {
  return {
    [CircuitComponentType.VERIFICATION_KEY]: `${veridaBaseUri}/${circuitId}/verification_key.json`,
    [CircuitComponentType.PROVING_KEY]: `${veridaBaseUri}/${circuitId}/circuit_final.zkey`,
    [CircuitComponentType.WASM]: `${veridaBaseUri}/${circuitId}/circuit.wasm`,
  }
}

export function createCircuitStorage() {
  return new CircuitStorage(new InMemoryDataSource<CircuitData>())
}

export async function initCircuitStorage(circuitStorage: CircuitStorage) {
  Promise.all([
    circuitStorage.saveCircuitData(
      CircuitId.AuthV2,
      await getCircuitData(CircuitId.AuthV2)
    ),
    circuitStorage.saveCircuitData(
      CircuitId.AtomicQuerySigV2,
      await getCircuitData(CircuitId.AtomicQuerySigV2)
    ),
    circuitStorage.saveCircuitData(
      CircuitId.AtomicQueryMTPV2,
      await getCircuitData(CircuitId.AtomicQueryMTPV2)
    ),
  ])
  // TODO: Consider using Promise.allSettled, capturing errors gracefully and accepting to go forward if the bare minimum of circuits (to define) are a success
}

export async function getCircuitData(
  circuitId: CircuitId
): Promise<CircuitData> {
  const filePaths = getCircuitFilePaths(circuitId)

  const [verificationKey, provingKey, wasm] = await Promise.all(
    Object.values(filePaths).map((filePath) =>
      fetchAndDecodeBase64EncodedFile(filePath)
    )
  )

  return {
    circuitId: String(circuitId),
    verificationKey,
    provingKey,
    wasm,
  }
}

export function base64StringToUint8Array(value: string) {
  return Uint8Array.from(window.atob(value), (c) => c.charCodeAt(0))
}

export async function fetchAndDecodeBase64EncodedFile(url: string) {
  try {
    const exists = await RNBlobUtil.fs.exists(url)
    if (!exists) {
      throw new Error(`Circuit does not exist at ${url}`)
    }
    const file = await RNBlobUtil.fs.readFile(url, 'base64')
    return base64StringToUint8Array(file)
  } catch (error) {
    throw new Error(`Error fetching the circuit ${url}`)
  }
}

export async function downloadCircuit(
  circuitId: `${CircuitId}`,
  veridaBaseUri: string,
  updateDownloadState: UpdateDownloadStateCallback
) {
  if (veridaBaseUri.endsWith('/')) {
    throw new Error('Do not include a trailing slash in the veridaBaseUri!')
  }

  // If the circuits dir doesn't exist, create it.
  await createCircuitsDir() // TODO: To remove once done above

  // Create the circuitId-specific directory within the circuits dir where
  // we'll store these files.
  await createCircuitDir(circuitId)

  const circuitFilePaths = getCircuitFilePaths(circuitId)

  const circuitRemoteUris = getCircuitRemoteUri({
    veridaBaseUri,
    circuitId,
  })

  await Promise.all(
    Object.entries(circuitRemoteUris).map(([circuitType, uri]) =>
      RNBlobUtil.fetch('GET', uri, {})
        .progress((receivedBytes, totalBytes) =>
          updateDownloadState({
            circuitId: circuitId as CircuitId,
            circuitType: circuitType as CircuitComponentType,
            circuitComponentDownloadState: {
              status: CircuitComponentDownloadStatus.DOWNLOADING,
              receivedBytes,
              totalBytes,
            },
          })
        )
        .then((result) => result.base64())
        .then((base64) => {
          const maybePath =
            circuitFilePaths[circuitType as CircuitComponentType]

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
  Object.keys(CircuitComponentType).forEach((circuitType) =>
    updateDownloadState({
      circuitId: circuitId as CircuitId,
      circuitType: circuitType as CircuitComponentType,
      circuitComponentDownloadState: {
        status: CircuitComponentDownloadStatus.DOWNLOADED,
      },
    })
  )
}

export function getUninitializedCircuitDownloadStates() {
  return Object.fromEntries(
    ALL_CIRCUIT_IDS.map((circuitId) => {
      return [
        circuitId,
        Object.fromEntries(
          Object.keys(CircuitComponentType).map((circuitType) => {
            return [
              circuitType as CircuitComponentType,
              {
                status: CircuitComponentDownloadStatus.UNINITIALIZED,
              },
            ]
          })
        ),
      ]
    })
  ) as CircuitDownloadStates
}

export async function getCircuitDownloadStates() {
  return Object.fromEntries(
    await Promise.all(
      ALL_CIRCUIT_IDS.map(async (circuitId) => {
        const circuitFilePaths = getCircuitFilePaths(circuitId)

        return [
          circuitId,
          Object.fromEntries(
            await Promise.all(
              Object.keys(CircuitComponentType).map((circuitType) =>
                RNBlobUtil.fs
                  .exists(circuitFilePaths[circuitType as CircuitComponentType])
                  .then(
                    (exists): CircuitComponentDownloadState =>
                      exists
                        ? { status: CircuitComponentDownloadStatus.DOWNLOADED }
                        : {
                            status:
                              CircuitComponentDownloadStatus.UNINITIALIZED,
                          }
                  )
                  .then((circuitDownloadState) => [
                    circuitType as CircuitComponentType,
                    circuitDownloadState,
                  ])
              )
            )
          ),
        ]
      })
    )
  ) as CircuitDownloadStates
}

export function getCircuitDownloadState(
  circuitId: `${CircuitId}`,
  circuitDownloadStates: CircuitDownloadStates
): CircuitDownloadState {
  const { [circuitId]: circuitDownloadState } = circuitDownloadStates

  return circuitDownloadState
}

export function isCircuitDownloaded(
  circuitDownloadState: CircuitDownloadState
) {
  const componentStates = Object.entries(circuitDownloadState).map(
    ([, { status }]) => status
  )

  return componentStates.every(
    (state) => state === CircuitComponentDownloadStatus.DOWNLOADED
  )
}

export function isCircuitDownloading(
  circuitDownloadState: CircuitDownloadState
) {
  const componentStates = Object.entries(circuitDownloadState).map(
    ([, { status }]) => status
  )

  return !!componentStates.find(
    (state) => state === CircuitComponentDownloadStatus.DOWNLOADING
  )
}

export function areCircuitsDownloaded(
  circuitDownloadStates: CircuitDownloadStates
) {
  return Object.values(circuitDownloadStates).every((circuitDownloadState) =>
    isCircuitDownloaded(circuitDownloadState)
  )
}

export function areCircuitsDownloading(
  circuitDownloadStates: CircuitDownloadStates
) {
  return !!Object.values(circuitDownloadStates).find((circuitDownloadState) =>
    isCircuitDownloading(circuitDownloadState)
  )
}
