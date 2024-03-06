import { CircuitId } from '@0xpolygonid/js-sdk'

export enum CircuitComponentType {
  WASM = 'WASM',
  VERIFICATION_KEY = 'VERIFICATION_KEY',
  PROVING_KEY = 'PROVING_KEY',
}

export enum CircuitStatus {
  UNKNOWN = 'UNKNOWN',
  UNAVAILABLE = 'UNAVAILABLE',
  DOWNLOADING = 'DOWNLOADING',
  AVAILABLE = 'AVAILABLE',
}

export type CircuitComponentPaths = {
  readonly [key in CircuitComponentType]: string
}

export type CircuitState = {
  readonly status: CircuitStatus
}

export type CircuitStates = {
  readonly [key in CircuitId]: CircuitState
}

export type UpdateStateCallback = (
  circuitId: CircuitId,
  status: CircuitStatus
) => void
