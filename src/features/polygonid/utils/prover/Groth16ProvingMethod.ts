import { ProvingMethod, ProvingMethodAlg, ZKProof } from '@iden3/js-jwz'

import { CalculateWitnessFunction } from '../../types'
import { polygonIdLogger as logger } from '../logger'
import { prove } from './prover'

export class Groth16ProvingMethod implements ProvingMethod {
  constructor(
    public readonly methodAlg: ProvingMethodAlg,
    public calculateWitness: CalculateWitnessFunction
  ) {
    // nothing
  }

  get alg(): string {
    return this.methodAlg.alg
  }

  get circuitId(): string {
    return this.methodAlg.circuitId
  }

  async verify(
    _messageHash: Uint8Array,
    _proof: ZKProof,
    _verificationKey: Uint8Array
  ): Promise<boolean> {
    logger.warn('Verifying with Groth16ProvingMethod not implemented')
    throw new Error('Method not implemented')
  }

  async prove(
    inputs: Uint8Array,
    provingKey: Uint8Array,
    wasm: Uint8Array
  ): Promise<ZKProof> {
    logger.info('Proving with Groth16ProvingMethod...')
    return prove(inputs, provingKey, wasm, this.calculateWitness)
  }
}
