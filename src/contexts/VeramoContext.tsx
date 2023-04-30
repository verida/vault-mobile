import { getResolver as getCheqdDidResolver } from '@cheqd/did-provider-cheqd'
import { createAgent, ICredentialPlugin, IResolver, TAgent } from '@veramo/core'
import {
  CredentialIssuerLD,
  ICredentialIssuerLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
  VeramoEd25519Signature2018,
  VeramoEd25519Signature2020,
  VeramoJsonWebSignature2020,
} from '@veramo/credential-ld'
import { CredentialPlugin } from '@veramo/credential-w3c'
import {
  DIDResolverPlugin,
  getUniversalResolverFor,
} from '@veramo/did-resolver'
import { getResolver as getVdaDidResolver } from '@verida/vda-did-resolver'
import React, { createContext } from 'react'

type VeramoAgentInterfaces = IResolver & ICredentialPlugin & ICredentialIssuerLD

const agent = createAgent<VeramoAgentInterfaces>({
  plugins: [
    new DIDResolverPlugin({
      ...getVdaDidResolver(),
      ...getCheqdDidResolver(), // TODO: Remove cheqd resolver and declare it in the universal resolver
      ...getUniversalResolverFor(['polygonid']),
    }),
    new CredentialPlugin(),
    new CredentialIssuerLD({
      contextMaps: [LdDefaultContexts],
      suites: [
        new VeramoEcdsaSecp256k1RecoverySignature2020(),
        new VeramoJsonWebSignature2020(),
        new VeramoEd25519Signature2018(),
        new VeramoEd25519Signature2020(),
      ],
    }),
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
