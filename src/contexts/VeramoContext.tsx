import { getResolver as getCheqdDidResolver } from '@cheqd/did-provider-cheqd'
import { createAgent, ICredentialPlugin, IResolver, TAgent } from '@veramo/core'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { getResolver as getVdaDidResolver } from '@verida/vda-did-resolver'
import React, { createContext } from 'react'

type VeramoAgentInterfaces = IResolver & ICredentialPlugin

const agent = createAgent<VeramoAgentInterfaces>({
  plugins: [
    new DIDResolverPlugin({
      ...getVdaDidResolver(),
      ...getCheqdDidResolver(),
    }),
    new CredentialPlugin(),
  ],
})

export type VeramoContextType = {
  agent: TAgent<VeramoAgentInterfaces>
}

export const VeramoContext = createContext<VeramoContextType>({ agent })

export const VeramoProvider: React.FunctionComponent = (props) => {
  return (
    <VeramoContext.Provider value={{ agent }}>
      {props.children}
    </VeramoContext.Provider>
  )
}
