import { VerificationResult } from 'features/verifiableCredential'

export function getCredentialValidityStatus(
  verificationResult?: VerificationResult
) {
  return !verificationResult
    ? 'unknown'
    : verificationResult.revoked
    ? 'revoked'
    : verificationResult.suspended
    ? 'suspended'
    : verificationResult.verified
    ? 'valid'
    : 'invalid'
}
