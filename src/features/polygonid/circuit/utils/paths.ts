import type { CircuitId } from '@0xpolygonid/js-sdk'

import { CircuitSpecificStrings, CircuitType } from '../@types'

export const getCircuitsDir = ({
  publicDir,
}: {
  readonly publicDir: string
}): string => `${publicDir}/circuits`

export const getCircuitDir = ({
  circuitId,
  publicDir,
}: {
  readonly circuitId: `${CircuitId}`
  readonly publicDir: string
}) => `${getCircuitsDir({ publicDir })}/${circuitId}`

export const getCircuitFilePaths = ({
  circuitId,
  publicDir,
}: {
  readonly circuitId: `${CircuitId}`
  readonly publicDir: string
}): CircuitSpecificStrings => {
  const parent = getCircuitDir({ circuitId, publicDir })

  const verificationKeyPath = `${parent}/verification_key.base64`
  const provingKeyPath = `${parent}/circuit_final.base64`
  const wasmPath = `${parent}/wasm.base64`

  return {
    [CircuitType.VERIFICATION_KEY]: verificationKeyPath,
    [CircuitType.PROVING_KEY]: provingKeyPath,
    [CircuitType.WASM]: wasmPath,
  }
}

export const getCircuitRemoteUri = ({
  circuitId,
  veridaBaseUri,
}: {
  readonly circuitId: `${CircuitId}`
  readonly veridaBaseUri: string
}): CircuitSpecificStrings => ({
  [CircuitType.VERIFICATION_KEY]: `${veridaBaseUri}/${circuitId}/verification_key.json`,
  [CircuitType.PROVING_KEY]: `${veridaBaseUri}/${circuitId}/circuit_final.zkey`,
  [CircuitType.WASM]: `${veridaBaseUri}/${circuitId}/circuit.wasm`,
})
