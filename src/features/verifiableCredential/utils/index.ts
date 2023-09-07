import {
  CredentialValidityStatus,
  VerificationResult,
} from 'features/verifiableCredential'

export function getCredentialValidityStatus(
  verificationResult?: VerificationResult
): CredentialValidityStatus {
  return !verificationResult
    ? 'unknown'
    : verificationResult.revoked
    ? 'revoked'
    : verificationResult.suspended
    ? 'suspended'
    : verificationResult.verified
    ? 'valid'
    : verificationResult.error?.message?.match('expired')
    ? 'expired'
    : 'invalid'
}
