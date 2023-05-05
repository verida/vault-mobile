import { CircuitDownloadStatus, CircuitSpecificDownloadStates } from '../@types'

export function isCircuitDownloaded(
  circuitSpecificDownloadStates: CircuitSpecificDownloadStates
) {
  const states = Object.entries(circuitSpecificDownloadStates).map(
    ([, { status }]) => status
  )

  return states.every((state) => state === CircuitDownloadStatus.DOWNLOADED)
}
