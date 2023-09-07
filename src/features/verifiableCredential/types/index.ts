import { IVerifyResult } from '@veramo/core'

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
