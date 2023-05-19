import * as Sentry from '@sentry/react-native'
import {
  IError,
  IVerifyCredentialArgs,
  IVerifyResult,
  VerifiableCredential,
  W3CVerifiableCredential,
} from '@veramo/core'
import { useVeramo } from 'features/veramo'
import { useCallback } from 'react'

import { ValidState } from '../types'

export const useCredential = () => {
  const { agent } = useVeramo()

  const verifyCredential = useCallback(
    async (
      credential: W3CVerifiableCredential,
      options?: Omit<IVerifyCredentialArgs, 'credential'>
    ): Promise<
      | {
          verified: false
          valid: 'unknown'
          error: IError
        }
      | {
          verified: true
          valid: ValidState
          issuer: string
          result: IVerifyResult
          verifiedCredential: VerifiableCredential
        }
    > => {
      const defaultVerificationOptions: IVerifyCredentialArgs = {
        credential,
        fetchRemoteContexts: true,
        policies: {
          audience: true,
          issuanceDate: true,
          credentialStatus: true,
          expirationDate: true,
        },
      }

      const opts: IVerifyCredentialArgs = Object.assign(
        {},
        defaultVerificationOptions,
        options
      )

      let verificationResult: IVerifyResult
      try {
        // TODO: Do validation of the data before as the agent is not doing it
        verificationResult = await agent.verifyCredential(opts)
      } catch (error: unknown) {
        // Likely to be something unsupported by our Veramo agent configuration
        Sentry.captureException(error)
        return {
          verified: false,
          valid: 'unknown',
          error: error as IError,
        }
      }

      return {
        verified: true,
        valid: 'error' in verificationResult ? 'invalid' : 'valid',
        issuer: verificationResult.issuer,
        result: verificationResult,
        verifiedCredential:
          verificationResult.verifiableCredential as VerifiableCredential,
      }
    },
    [agent]
  )

  // Expose other Veramo functions as needed

  return { verifyCredential }
}
