import { ICheqdVerifyCredentialWithStatusList2021Args } from '@cheqd/did-provider-cheqd'
import {
  IVerifyCredentialArgs,
  IVerifyResult,
  VerifiableCredential,
} from '@veramo/core'
import { useCallback } from 'react'

import { usePolygonId } from '~/features/polygonid'
import { Logger } from '~/features/telemetry'
import { extractIssuer, useVeramo } from '~/features/veramo'

import { VerificationResult } from '../types'

const logger = Logger.create('Verifiable Credential')

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
  const { manager: polygonIdManager } = usePolygonId()

  const verifyCredential = useCallback(
    async (
      credential: VerifiableCredential,
      options?: Omit<IVerifyCredentialArgs, 'credential'>
    ): Promise<VerificationResult | undefined> => {
      logger.info('Verifying credential')

      const resolvedOptions: Omit<IVerifyCredentialArgs, 'credential'> =
        Object.assign({}, defaultVerificationOptions, options)

      try {
        let verificationResult: IVerifyResult

        const subject = credential.credentialSubject.id
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
        } else if (
          (subject?.startsWith('did:polygonid') ||
            issuer.startsWith('did:polygonid')) &&
          !!credential.credentialStatus
        ) {
          // TODO: Try to make a Veramo plugin for Polygon ID
          if (!polygonIdManager) {
            return undefined
          }

          const polygonIdCredential =
            await polygonIdManager.credentialWallet?.findById(
              credential.id as string
            )

          if (!polygonIdCredential) {
            return undefined
          }

          return await polygonIdManager.verifyCredential(polygonIdCredential)
        } else {
          logger.debug('Verifying generic credential with Veramo native method')
          verificationResult = await agent.verifyCredential({
            credential,
            ...resolvedOptions,
          })
        }

        if (verificationResult.error?.errorCode === 'Network request failed') {
          return undefined
        }

        return verificationResult
      } catch (error) {
        // Likely to be something unsupported by our Veramo agent configuration
        // Returning undefined means the verification is not conclusive
        logger.error(error)
      }
    },
    [agent, polygonIdManager]
  )

  // Expose other Veramo functions as needed

  return { verifyCredential }
}
