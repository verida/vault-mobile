import { W3CVerifiableCredential } from '@veramo/core'
import { useCallback } from 'react'

import { useVeramo } from 'hooks/useVeramo'

export const useCredential = () => {
  const { agent } = useVeramo()

  const verifyCredential = useCallback(
    async (credential: W3CVerifiableCredential) => {
      const verifiedCredential = await agent.verifyCredential({
        credential,
      })
      // TODO: Do validation of the data before as the agent is not doing it

      // TODO: Get a stronger type for the data
      const payload = verifiedCredential.payload
      const subject = payload.sub as string | undefined
      const data = payload.vc.credentialSubject
      const schemaUri = payload.vc.credentialSchema.id as string | undefined
      const issuer = payload.iss as string | undefined
      const contextName = payload.vc.veridaContextName as string | undefined
      // TODO: Check if relevant as not standard and not provided on credential not created by Verida

      return {
        /** The whole credential */
        verifiedCredential,
        /**  */
        payload,
        /** The Subject DID */
        subject,
        /** The data from credentialSubject */
        data,
        /** The schema URI from credentialSchema */
        schemaUri,
        /** The issuer DID */
        issuer,
        /** The verida context that created the credential */
        contextName,
      }
    },
    [agent]
  )

  // TODO: Expose other Veramo functions as needed

  return { verifyCredential }
}
