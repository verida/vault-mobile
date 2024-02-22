import { byteDecoder } from '@0xpolygonid/js-sdk'
import { ZKProof } from '@iden3/js-jwz'
import { NativeModules } from 'react-native'
import { fromByteArray } from 'react-native-quick-base64'

import { CalculateWitnessFunction } from '../../types'
import { polygonIdLogger as logger } from '../logger'

const rapidsnark = NativeModules.Rapidsnark

export const prove = async (
  inputs: Uint8Array,
  provingKey: Uint8Array,
  wasm: Uint8Array,
  calculateWitness: CalculateWitnessFunction
): Promise<ZKProof> => {
  logger.debug('Proving inputs...')
  const parsedInputs = JSON.parse(byteDecoder.decode(inputs))

  logger.debug('Execute witness calculator')
  const witness = await calculateWitness(wasm, parsedInputs)
  if (!witness) {
    // TODO: Have the calculateWitness throw an error instead, then wrap it with a trycatch to throw a 'Witness calculator failed' error and pass the original error as cause
    throw new Error('Witness calculator failed')
  }
  logger.debug('Witness calculator successfully executed')

  logger.debug('Execute groth16 prover with rapidsnark')
  const { proof, pub_signals } = await rapidsnark.groth16_prover(
    fromByteArray(provingKey),
    witness
  )
  logger.debug('Groth16 prover executed successfully')

  return {
    proof: JSON.parse(proof),
    pub_signals: JSON.parse(pub_signals),
  }
}
