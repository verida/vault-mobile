import { ZKProof } from '@iden3/js-jwz'
import { groth16Verify } from '@iden3/react-native-rapidsnark'
import { Logger } from 'features/telemetry'
import { fromByteArray } from 'react-native-quick-base64'

const logger = Logger.create('PolygonId')

export async function verify(
  zkProof: ZKProof,
  verificationKey: Uint8Array
): Promise<boolean> {
  logger.debug('Verifying ZK proof...')
  const { proof, pub_signals } = zkProof

  logger.debug('Executing groth16Verify...')
  const isValid = await groth16Verify(
    JSON.stringify(proof),
    JSON.stringify(pub_signals),
    fromByteArray(verificationKey)
  )
  logger.debug('groth16Verify executed successfully')

  return isValid
}
