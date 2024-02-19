import { CircuitId, CredentialStatusType } from '@0xpolygonid/js-sdk'

export type WitnessCalculatorFunction = (
  wasm: Uint8Array,
  data: JSON
) => Promise<string>

export type PolygonIdConfig = {
  polygonIdBlockchain: string
  polygonIdNetworkId: string
  polygonIdDidMethod: string
  polygonIdRevocationBaseUrl: string
  polygonIdRevocationType: CredentialStatusType
  polygonIdRpcUrl: string
  polygonIdContractAddress: string
  polygonIdIpfsGatewayUrl?: string
}

export enum CircuitComponentType {
  WASM = 'WASM',
  VERIFICATION_KEY = 'VERIFICATION_KEY',
  PROVING_KEY = 'PROVING_KEY',
}

export enum CircuitComponentDownloadStatus {
  UNINITIALIZED = 'UNINITIALIZED',
  DOWNLOADING = 'DOWNLOADING',
  DOWNLOADED = 'DOWNLOADED',
}

export type CircuitComponentPaths = {
  readonly [key in CircuitComponentType]: string
}

type AbstractCircuitComponentDownloadState<
  Status extends CircuitComponentDownloadStatus
> = {
  readonly status: Status
}

export type CircuitComponentDownloadState =
  | AbstractCircuitComponentDownloadState<CircuitComponentDownloadStatus.UNINITIALIZED>
  | (AbstractCircuitComponentDownloadState<CircuitComponentDownloadStatus.DOWNLOADING> & {
      readonly receivedBytes: number
      readonly totalBytes: number
    })
  | AbstractCircuitComponentDownloadState<CircuitComponentDownloadStatus.DOWNLOADED>

export type CircuitDownloadState = {
  readonly [key in CircuitComponentType]: CircuitComponentDownloadState
}

export type CircuitDownloadStates = {
  readonly [key in CircuitId]: CircuitDownloadState
}

export type UpdateDownloadStateCallbackProps = {
  circuitId: CircuitId
  circuitType: CircuitComponentType
  circuitComponentDownloadState: CircuitComponentDownloadState
}

export type UpdateDownloadStateCallback = (
  props: UpdateDownloadStateCallbackProps
) => void
