import { CircuitId } from '@0xpolygonid/js-sdk'
import RNBlobUtil from 'react-native-blob-util'

// TODO: Force this to be a function of enum depth.
export const ALL_CIRCUIT_IDS: readonly `${CircuitId}`[] = [
  'authV2',
  'stateTransition',
  'credentialAtomicQueryMTPV2',
  'credentialAtomicQuerySigV2',
]

export const POLYGONID_CIRCUITS_DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/verida/public/circuits`
