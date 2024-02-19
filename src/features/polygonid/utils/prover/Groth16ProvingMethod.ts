import { ProvingMethod, ProvingMethodAlg, ZKProof } from '@iden3/js-jwz'

import { WitnessCalculatorFunction } from '../../types'
import { prove } from './prover'

export class Groth16ProvingMethod implements ProvingMethod {
  constructor(
    public readonly methodAlg: ProvingMethodAlg,
    public witnessCalculator: WitnessCalculatorFunction
  ) {}

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
    throw new Error('Method not implemented')
  }

  async prove(
    inputs: Uint8Array,
    provingKey: Uint8Array,
    wasm: Uint8Array
  ): Promise<ZKProof> {
    return prove(inputs, provingKey, wasm, this.witnessCalculator)
  }
}
