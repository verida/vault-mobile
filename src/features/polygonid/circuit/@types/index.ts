import type { CircuitId } from '@0xpolygonid/js-sdk'

import { Stateful } from '../../@types'

export enum CircuitType {
  WASM = 'WASM',
  VERIFICATION_KEY = 'VERIFICATION_KEY',
  PROVING_KEY = 'PROVING_KEY',
}

export enum CircuitDownloadStatus {
  UNINITIALIZED = 'UNINITIALIZED',
  DOWNLOADING = 'DOWNLOADING',
  DOWNLOADED = 'DOWNLOADED',
}

type AbstractCircuitDownloadState<Status extends CircuitDownloadStatus> = {
  readonly status: Status
}

export type CircuitDownloadState =
  | AbstractCircuitDownloadState<CircuitDownloadStatus.UNINITIALIZED>
  | (AbstractCircuitDownloadState<CircuitDownloadStatus.DOWNLOADING> & {
      readonly receivedBytes: number
      readonly totalBytes: number
    })
  | AbstractCircuitDownloadState<CircuitDownloadStatus.DOWNLOADED>

export type CircuitSpecificDownloadStates = {
  readonly [key in CircuitType]: CircuitDownloadState
}

export type CircuitDownloadStates = {
  readonly [key in CircuitId]: CircuitSpecificDownloadStates
}

export type CircuitSpecificStrings = {
  readonly [key in CircuitType]: string
}

export type AssertDownloadStateCallbackProps = {
  circuitId: CircuitId
  circuitType: CircuitType
  circuitDownloadState: CircuitDownloadState
}

export type AssertDownloadStateCallback = (
  props: AssertDownloadStateCallbackProps
) => void

export type CircuitContextValue = {
  // Location of the circuit file server.
  readonly uri: string
  // Local directory root of circuits we save.
  readonly publicDir: string
  // Tracking the states of downloaded circuits.
  readonly circuitDownloadStates: Stateful<CircuitDownloadStates>
  // Asynchronously assign the state of a download.
  readonly assertDownloadState: AssertDownloadStateCallback
}
