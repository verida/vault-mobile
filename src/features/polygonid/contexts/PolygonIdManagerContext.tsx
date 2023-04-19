import {
  AuthorizationRequestMessage,
  CredentialsOfferMessage,
  PROTOCOL_CONSTANTS,
} from '@0xpolygonid/js-sdk'
import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { EnvironmentType } from '@verida/types'
import React, { createContext, useCallback, useMemo } from 'react'

import {
  PolygonIdManagerConfig,
  useCreatePolygonIdManager,
  usePolygonContext,
} from '../polygon'
import { parseQrCodeMessage } from '../utils'

type PolygonIdContextType = {
  handleQRCodeMessage: (data: string) => void
  handleAcceptConnectionRequest: (
    data: AuthorizationRequestMessage
  ) => Promise<boolean>
  handleAcceptProofRequest: (
    data: AuthorizationRequestMessage
  ) => Promise<boolean>
  handleAcceptCredentialOffer: (
    data: CredentialsOfferMessage
  ) => Promise<boolean>
}
// TODO: For all handle functions, return something else than a boolean

export const PolygonIdManagerContext =
  createContext<PolygonIdContextType | null>(null)

// TODO: Define the config based on the current selected Account
// TODO: Find a better way to pass the sensitive information to the manager.
const config: PolygonIdManagerConfig = {
  polygonIdSeed: 'daveseedseedseedseedseedseeduser',
  veridaPrivateKey:
    'sphere divide black dove never shoot world issue brand achieve income raw',
  environment: EnvironmentType.TESTNET,
  contextName: 'Verida: Vault',
  didClientConfig: {
    callType: 'gasless',
    web3Config: {
      rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
      serverConfig: {
        headers: {
          'context-name': 'Verida: Vault',
        },
      },
      postConfig: {
        headers: {
          'user-agent': 'Verida-Vault',
        },
      },
      endpointUrl: 'https://meta-tx-server1.tn.verida.tech',
    },
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    didEndpoints: [],
  },
}

export const PolygonIdManagerProvider: React.FunctionComponent = (props) => {
  const { children } = props

  const navigation = useNavigation()

  const { handleAuthorizationRequest, handleCredentialOffer } =
    usePolygonContext()
  const state = useCreatePolygonIdManager(config)
  const maybeManagerId = 'result' in state ? state.result : undefined

  const handleQRCodeMessage = useCallback(
    async (qrCodeMessage: string) => {
      const data = parseQrCodeMessage(qrCodeMessage) // TODO: Handle error

      switch (data.type) {
        case PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE
          .AUTHORIZATION_REQUEST_MESSAGE_TYPE:
          const requestData = data as AuthorizationRequestMessage
          // Either a Connection request or a ZK Proof request
          // if (data.body.scope && data.body.scope.length) {
          if (requestData.body?.scope && requestData.body.scope.length) {
            // We have a scope object implying we need to submit a ZK proof
            navigation.navigate('ProofRequest', {
              name: 'Compliant DEX', // TODO: Find a way to get it
              // logo: 'https://img.logoipsum.com/246.png',
              logo: 'https://img.logoipsum.com/247.png',
              details: {
                timestamp: new Date(),
                requesterId: requestData.from,
                message:
                  // requestData.body?.reason || // TODO: Enable after demo
                  'Please provide a KYC proof to unlock additional features',
                url: 'https://compliant-defi.demo.verida.io',
              },
              data: requestData,
            })
          } else {
            // We have a generic connection request
            navigation.navigate('ConnectionRequest', {
              name: 'GateKeeper', // TODO: Find a way to get it
              logo: 'https://www.gitbook.com/cdn-cgi/image/width=40,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F2089358966-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FcsJ16ZcrlkRarpduMtf3%252Ficon%252Fw82c12VFG0mG431s6uZS%252FTwitter.png%3Falt%3Dmedia%26token%3Da8f08639-fbf6-4542-b1c3-e8b4b9f03422',
              hostname: 'https://gatekeeper.software', // TODO: Get from the callback?
              details: {
                timestamp: new Date(),
                requesterId: requestData.from,
                message:
                  // requestData.body?.reason || // TODO: Enable after demo
                  'Please, accept this connection to perform your KYC',
              },
              data: requestData,
            })
          }
          break
        case PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE
          .CREDENTIAL_OFFER_MESSAGE_TYPE:
          const offerData = data as CredentialsOfferMessage
          // Offer to save a new ZK credential
          navigation.navigate('IncomingDataRequest', {
            name: 'GateKeeper', // TODO: Find a way to get it
            logo: 'https://www.gitbook.com/cdn-cgi/image/width=40,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F2089358966-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FcsJ16ZcrlkRarpduMtf3%252Ficon%252Fw82c12VFG0mG431s6uZS%252FTwitter.png%3Falt%3Dmedia%26token%3Da8f08639-fbf6-4542-b1c3-e8b4b9f03422',
            details: {
              timestamp: new Date(),
              requesterId: offerData.from,
              message: `Your KYC credential is attached to this message.`,
              url: 'https://gatekeeper.software',
            },
            data: offerData,
          })
          break
      }
    },
    [navigation]
  )

  const handleAcceptConnectionRequest = useCallback(
    async (data: AuthorizationRequestMessage) => {
      try {
        console.debug('Accepting Connection Request...')
        console.debug('managerId: ', maybeManagerId)
        await handleAuthorizationRequest({ data, managerId: maybeManagerId! })
        // TODO: define what to do afterwards (confirmation screen?)
        return true
      } catch (error: unknown) {
        Sentry.captureException(error)
        // TODO: Handle error in UI. Use error.message?
        return false
      }
    },
    [maybeManagerId, handleAuthorizationRequest]
  )

  const handleAcceptProofRequest = useCallback(
    async (data: AuthorizationRequestMessage) => {
      try {
        console.debug('Accepting Proof Request')
        await handleAuthorizationRequest({ data, managerId: maybeManagerId! })
        // TODO: define what to do afterwards (confirmation screen?)
        return true
      } catch (error: unknown) {
        Sentry.captureException(error)
        // TODO: Handle error in UI. Use error.message?
        return false
      }
    },
    [maybeManagerId, handleAuthorizationRequest]
  )

  const handleAcceptCredentialOffer = useCallback(
    async (data: CredentialsOfferMessage) => {
      try {
        console.debug('Accepting Credential Offer...')
        await handleCredentialOffer({ data, managerId: maybeManagerId! })
        // TODO: define what to do afterwards (confirmation screen?)
        return true
      } catch (error: unknown) {
        Sentry.captureException(error)
        // TODO: Handle error in UI. Use error.message?
        return false
      }
    },
    [maybeManagerId, handleCredentialOffer]
  )

  const contextValue: PolygonIdContextType = useMemo(
    () => ({
      handleQRCodeMessage,
      handleAcceptConnectionRequest,
      handleAcceptProofRequest,
      handleAcceptCredentialOffer,
    }),
    [
      handleQRCodeMessage,
      handleAcceptConnectionRequest,
      handleAcceptProofRequest,
      handleAcceptCredentialOffer,
    ]
  )

  return (
    <PolygonIdManagerContext.Provider value={contextValue}>
      {children}
    </PolygonIdManagerContext.Provider>
  )
}
