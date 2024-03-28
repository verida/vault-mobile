import {
  CREDENTIALS_DATABASE_NAME,
  CredentialValidityStatus,
  VerificationResult,
} from 'features/verifiableCredential'

import Folder from 'api/VaultCommon/managers/data/folder'

export function getCredentialValidityStatus(
  verificationResult?: VerificationResult
): CredentialValidityStatus {
  return !verificationResult
    ? 'unknown'
    : verificationResult.revoked
      ? 'revoked'
      : verificationResult.suspended
        ? 'suspended'
        : verificationResult.expired ||
            verificationResult.error?.message?.match('expired')
          ? 'expired'
          : verificationResult.verified === false
            ? 'invalid'
            : verificationResult.verified === true
              ? 'valid'
              : 'unknown'
}

export function isCredentialsDatabase(folder: Folder) {
  return folder.config?.database === CREDENTIALS_DATABASE_NAME
}
