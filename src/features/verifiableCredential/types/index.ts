import { IVerifyResult, VerifiableCredential } from '@veramo/core'
import { VeridaRecord, VeridaUnsavedRecord } from 'features/verida'

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

export type VeridaVerifiableCredentialBase<T = Record<string, unknown>> = {
  credentialData: VerifiableCredential & {
    credentialSubject: {
      id?: string
    } & T
  }
  credentialSchema: string
}

export type VeridaVerifiableCredentialUnsavedRecord<
  T = Record<string, unknown>
> = VeridaUnsavedRecord<VeridaVerifiableCredentialBase<T>>

export type VeridaVerifiableCredentialRecord<T = Record<string, unknown>> =
  VeridaRecord<VeridaVerifiableCredentialBase<T>>
