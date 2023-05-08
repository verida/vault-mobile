import { CircuitId } from '@0xpolygonid/js-sdk'

// TODO: Force this to be a function of enum depth.
export const ALL_CIRCUIT_IDS: readonly `${CircuitId}`[] = [
  'authV2',
  'stateTransition',
  'credentialAtomicQueryMTPV2',
  'credentialAtomicQuerySigV2',
]
