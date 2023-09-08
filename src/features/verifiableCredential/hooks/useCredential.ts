import { ICheqdVerifyCredentialWithStatusList2021Args } from '@cheqd/did-provider-cheqd'
import {
  IVerifyCredentialArgs,
  IVerifyResult,
  VerifiableCredential,
} from '@veramo/core'
import { extractIssuer } from '@veramo/utils'
import { Logger } from 'features/telemetry'
import { useVeramo } from 'features/veramo'
import { useCallback } from 'react'

import { VerificationResult } from '../types'

const logger = new Logger('Verifiable Credential')

const defaultVerificationOptions: Omit<IVerifyCredentialArgs, 'credential'> = {
  fetchRemoteContexts: true,
  policies: {
    audience: true,
    issuanceDate: true,
    credentialStatus: true,
    expirationDate: true,
  },
}

export const useCredential = () => {
  const { agent } = useVeramo()

  const verifyCredential = useCallback(
    async (
      credential: VerifiableCredential,
      options?: Omit<IVerifyCredentialArgs, 'credential'>
    ): Promise<VerificationResult | undefined> => {
      const resolvedOptions: Omit<IVerifyCredentialArgs, 'credential'> =
        Object.assign({}, defaultVerificationOptions, options)

      try {
        let verificationResult: IVerifyResult

        logger.debug('Credential', { credential })

        const issuer = extractIssuer(credential)

        if (issuer.startsWith('did:cheqd') && !!credential.credentialStatus) {
          logger.debug('Verifying Cheqd credential with status list')
          verificationResult = await agent.cheqdVerifyCredential({
            credential,
            fetchList: true,
            verificationArgs: {
              ...resolvedOptions,
            },
          } as ICheqdVerifyCredentialWithStatusList2021Args)
        } else {
          logger.debug('Verifying credential')
          verificationResult = await agent.verifyCredential({
            credential,
            ...resolvedOptions,
          })
        }
        logger.debug('Verification result:', {
          result: verificationResult,
        })

        return verificationResult
      } catch (error: unknown) {
        // Likely to be something unsupported by our Veramo agent configuration
        // Returning undefined means the verification is not conclusive
        logger.error(error)
      }
    },
    [agent]
  )

  // Expose other Veramo functions as needed

  return { verifyCredential }
}
