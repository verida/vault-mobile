import {
  Cheqd,
  CheqdDIDProvider,
  getResolver as getCheqdDidResolver,
  ICheqd,
} from '@cheqd/did-provider-cheqd'
import { CheqdNetwork } from '@cheqd/sdk'
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
import { CredentialStatusPlugin } from '@veramo/credential-status'
import { CredentialPlugin } from '@veramo/credential-w3c'
import {
  DIDResolverPlugin,
  getUniversalResolverFor,
} from '@veramo/did-resolver'
import { getResolver as getVdaDidResolver } from '@verida/vda-did-resolver'
import { Logger } from 'features/telemetry'
import React, { createContext } from 'react'

const logger = new Logger('Veramo')

const cheqdMainnetProvider = new CheqdDIDProvider({
  defaultKms: '',
  cosmosPayerSeed: '',
  networkType: CheqdNetwork.Mainnet,
})

const cheqdTestnetProvider = new CheqdDIDProvider({
  defaultKms: '',
  cosmosPayerSeed: '',
  networkType: CheqdNetwork.Testnet,
})

type VeramoAgentInterfaces = IResolver &
  ICredentialPlugin &
  ICredentialIssuerLD &
  ICheqd

logger.info('Creating Veramo agent')

const agent = createAgent<VeramoAgentInterfaces>({
  plugins: [
    new DIDResolverPlugin({
      ...getVdaDidResolver(),
      ...getCheqdDidResolver(),
      ...getUniversalResolverFor(['polygonid']),
      // TODO: Get the URL of the universal resolver from the env variables
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
    new CredentialStatusPlugin({
      // TODO: Add Credential status methods to support
    }),
    new Cheqd({
      providers: [cheqdMainnetProvider, cheqdTestnetProvider],
    }),
  ],
})

logger.info('Veramo agent created')

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
