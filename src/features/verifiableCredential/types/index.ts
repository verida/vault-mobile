import { IVerifyResult, VerifiableCredential } from '@veramo/core'
import { VeridaBaseRecord } from 'features/verida'

export type CredentialValidityStatus =
  | 'unknown'
  | 'valid'
  | 'invalid'
  | 'revoked'
  | 'suspended'
  | 'expired'

export type VerificationResult = {
  verified: boolean
  revoked?: boolean
  suspended?: boolean
  error?: IVerifyResult['error']
}

export type VeridaVerifiableCredentialRecord<T = Record<string, unknown>> =
  VeridaBaseRecord & {
    credentialData: VerifiableCredential & {
      credentialSubject: {
        id?: string
      } & T
    }
    credentialSchema: string
  }
