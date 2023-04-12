import { useCallback } from 'react'

import { useVeramo } from 'hooks/useVeramo'

export const useCredential = () => {
  const { agent } = useVeramo()

  const verifyCredential = useCallback(
    async (jwt: string) => {
      const verifiedResult = await agent.verifyCredential({
        credential: jwt,
      })
      // TODO: Do validation of the data before as the agent is not doing it
      // TODO: Get a stronger type for the data

      const payload = verifiedResult.payload
      const subject = payload.sub
      const data = payload.vc.credentialSubject
      const schemaUri = payload.vc.credentialSchema.id
      const issuer = payload.iss
      const contextName = payload.vc.veridaContextName

      return {
        payload,
        subject,
        data,
        schemaUri,
        issuer,
        contextName,
      }
    },
    [agent]
  )

  return { verifyCredential }
}
