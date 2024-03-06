import { CircuitData, CircuitId, CircuitStorage } from '@0xpolygonid/js-sdk'
import { Logger } from 'features/telemetry'

import {
  CircuitComponentPaths,
  CircuitComponentType,
  CircuitState,
  CircuitStates,
  CircuitStatus,
  UpdateStateCallback,
} from '../types'
import { PolygonIdCircuitDataSource, PolygonIdCircuitStorage } from './storage'

const logger = Logger.create('PolygonId')

export function createCircuitStorage() {
  logger.info('Creating circuit storage')
  return new PolygonIdCircuitStorage(new PolygonIdCircuitDataSource())
}

export async function initCircuitStorage(
  circuitStates: CircuitStates,
  circuitStorage: CircuitStorage,
  circuitsRemoteBaseUrl: string,
  updateState: UpdateStateCallback
) {
  logger.info('Initialising the circuit storage')
  const unavailableCircuits = Object.entries(circuitStates)
    .filter(
      ([, circuitState]) => circuitState.status === CircuitStatus.UNAVAILABLE
    )
    .map(([circuitId]) => circuitId as CircuitId)

  await downloadAndSaveCircuits(
    unavailableCircuits,
    circuitStorage,
    circuitsRemoteBaseUrl,
    updateState
  )

  logger.info('Circuit storage initialised')
}

export async function downloadAndSaveCircuits(
  circuitIds: CircuitId[],
  circuitStorage: CircuitStorage,
  circuitsRemoteBaseUrl: string,
  updateState: UpdateStateCallback
) {
  logger.debug('Downloading circuits...', { circuitIds })

  await Promise.all(
    circuitIds.map(async (circuitId) => {
      await downloadAndSaveCircuit(
        circuitId,
        circuitStorage,
        circuitsRemoteBaseUrl,
        updateState
      )
    })
  )
}

export async function downloadAndSaveCircuit(
  circuitId: CircuitId,
  circuitStorage: CircuitStorage,
  circuitsRemoteBaseUrl: string,
  updateState: UpdateStateCallback
) {
  try {
    updateState(circuitId, CircuitStatus.DOWNLOADING)

    const circuitData = await fetchCircuitData(circuitId, circuitsRemoteBaseUrl)

    logger.debug(`Saving the circuit data for ${circuitId}`)
    await circuitStorage.saveCircuitData(circuitId, circuitData)
    updateState(circuitId, CircuitStatus.AVAILABLE)
    logger.debug(
      `Circuit data for ${circuitId} successfully saved to circuit storage`
    )
  } catch (error) {
    updateState(circuitId, CircuitStatus.UNAVAILABLE)
    logger.error(
      new Error('Failed to save Polygon ID circuit data', { cause: error })
    )
  }
}

async function fetchCircuitData(
  circuitId: CircuitId,
  circuitsRemoteBaseUrl: string
): Promise<CircuitData> {
  logger.debug(`Getting circuit data for ${circuitId}`)

  const fileUrls = getCircuitFileUrls(circuitId, circuitsRemoteBaseUrl)

  const [verificationKey, provingKey, wasm] = await Promise.all(
    Object.values(fileUrls).map((url) => fetchCircuitFile(url))
  )

  logger.debug(`Circuit data for ${circuitId} successfully fetched`)
  return {
    circuitId: String(circuitId),
    verificationKey,
    provingKey,
    wasm,
  }
}

function getCircuitFileUrls(
  circuitId: CircuitId,
  circuitsRemoteBaseUrl: string
): CircuitComponentPaths {
  return {
    [CircuitComponentType.VERIFICATION_KEY]: `${circuitsRemoteBaseUrl}/${circuitId}/verification_key.json`,
    [CircuitComponentType.PROVING_KEY]: `${circuitsRemoteBaseUrl}/${circuitId}/circuit_final.zkey`,
    [CircuitComponentType.WASM]: `${circuitsRemoteBaseUrl}/${circuitId}/circuit.wasm`,
  }
}

async function fetchCircuitFile(url: string) {
  logger.debug('Fetching circuit file:', { url })

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch circuit ${url}`)
  }

  const buffer = await response.arrayBuffer()
  return new Uint8Array(buffer)
}

export function getCircuitState(
  circuitId: CircuitId,
  circuitStorage: PolygonIdCircuitStorage
): CircuitState {
  logger.debug(`Getting circuit state for ${circuitId}`)

  const exists = circuitStorage.checkCircuitDataExists(circuitId)
  if (exists) {
    logger.debug(`Circuit ${circuitId} is available`)
    return {
      status: CircuitStatus.AVAILABLE,
    }
  } else {
    logger.debug(`Circuit ${circuitId} is not available`)
    return {
      status: CircuitStatus.UNAVAILABLE,
    }
  }
}

export function getCircuitStates(
  circuitIds: CircuitId[],
  circuitStorage: PolygonIdCircuitStorage
) {
  logger.debug('Getting circuit states')
  return Object.fromEntries(
    circuitIds.map((circuitId) => [
      circuitId,
      getCircuitState(circuitId, circuitStorage),
    ])
  ) as CircuitStates
}

export function getInitialCircuitStates(circuitIds: CircuitId[]) {
  return Object.fromEntries(
    circuitIds.map((circuitId) => {
      return [
        circuitId,
        {
          status: CircuitStatus.UNKNOWN,
        },
      ]
    })
  ) as CircuitStates
}

export function isCircuitAvailable(circuitState: CircuitState) {
  return circuitState.status === CircuitStatus.AVAILABLE
}

export function isCircuitUnavailable(circuitState: CircuitState) {
  return circuitState.status === CircuitStatus.UNAVAILABLE
}

export function isCircuitDownloading(circuitState: CircuitState) {
  return circuitState.status === CircuitStatus.DOWNLOADING
}

export function areCircuitsAvailable(circuitStates: CircuitStates) {
  return Object.values(circuitStates).every((circuitState) =>
    isCircuitAvailable(circuitState)
  )
}

export function areCircuitsUnavailable(circuitStates: CircuitStates) {
  return Object.values(circuitStates).every((circuitState) =>
    isCircuitUnavailable(circuitState)
  )
}

export function areCircuitsDownloading(circuitStates: CircuitStates) {
  return !!Object.values(circuitStates).find((circuitState) =>
    isCircuitDownloading(circuitState)
  )
}
