import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import React, { createContext, useCallback, useEffect } from 'react'

import { DownloadProgressEvent, PolygonIDManager } from 'api/PolygonIDManager'

// Temporary data for testing purposes
const testRequests = {
  // '{"id":"cc7b28e7-9f80-474e-879c-2c3db8d29b5a","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/authorization/1.0/request","thid":"cc7b28e7-9f80-474e-879c-2c3db8d29b5a","body":{"callbackUrl":"https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=198059","reason":"test flow","scope":[{"id":1,"circuitId":"credentialAtomicQuerySigV2","query":{"allowedIssuers":["*"],"context":"https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld","credentialSubject":{"birthday":{"$lt":20000101}},"type":"KYCAgeCredential"}}]},"from":"did:polygonid:polygon:mumbai:2qH7XAwYQzCp9VfhpNgeLtK2iCehDDrfMWUCEg5ig5"}',
  connect:
    // auth request (connect)
    '{"id":"d4f9a5c1-ea40-46b4-86ef-4101f8eace15","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/authorization/1.0/request","thid":"d4f9a5c1-ea40-46b4-86ef-4101f8eace15","body":{"callbackUrl":"https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=956037","reason":"test flow","scope":[]},"from":"did:polygonid:polygon:mumbai:2qH7XAwYQzCp9VfhpNgeLtK2iCehDDrfMWUCEg5ig5"}',
  offer:
    // receive credential
    '{"id":"d20e7cf4-911a-4163-8374-82003eda7e04","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/credentials/1.0/offer","thid":"d20e7cf4-911a-4163-8374-82003eda7e04","body":{"url":"https://self-hosted-platform.polygonid.me/v1/agent","credentials":[{"id":"a5ee6ae7-cd4b-11ed-8e4f-0242c0a88005","description":"KYCAgeCredential"}]},"from":"did:polygonid:polygon:mumbai:2qH7XAwYQzCp9VfhpNgeLtK2iCehDDrfMWUCEg5ig5","to":"did:polygonid:polygon:mumbai:2qHtz8rrerMMAFEcQSRu6Mvajxx7vkNLptw7LSS6C4"}',
  verify:
    // auth request (verify)
    '{"id":"807cb8ea-5feb-4c4f-81d0-d756707d5024","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/authorization/1.0/request","thid":"807cb8ea-5feb-4c4f-81d0-d756707d5024","body":{"callbackUrl":"https://self-hosted-demo-backend-platform.polygonid.me/api/callback?sessionId=62378","reason":"test flow","scope":[{"id":1,"circuitId":"credentialAtomicQuerySigV2","query":{"allowedIssuers":["*"],"context":"https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld","credentialSubject":{"birthday":{"$lt":20000101}},"skipClaimRevocationCheck":true,"type":"KYCAgeCredential"}}]},"from":"did:polygonid:polygon:mumbai:2qH7XAwYQzCp9VfhpNgeLtK2iCehDDrfMWUCEg5ig5"}',
}

// Temporary initialisation of PolygonIDManager for testing purposes
const polygonIdSeed = 'daveseedseedseedseedseedseeduser'
const polygonIdManager = new PolygonIDManager(polygonIdSeed)

type PolygonIdContextType = {
  handleQRCodeData: (data: string) => void
}

const polygonIdContextDefaultValue: PolygonIdContextType = {
  handleQRCodeData: () => {
    // empty default function
  },
}

export const PolygonIdContext = createContext(polygonIdContextDefaultValue)

function usePolygonIdContext(): PolygonIdContextType {
  const navigation = useNavigation()

  // Define event listeners
  const initialisingEventHandler = useCallback((starting: boolean) => {
    console.log(starting ? 'initializing' : 'initialization complete')
  }, [])

  const downloadingEventHandler = useCallback(
    (progress: DownloadProgressEvent) => {
      console.log(`download progress; ${progress.count} / ${progress.total}`)
    },
    []
  )

  // Set up event listeners
  useEffect(() => {
    polygonIdManager.on('initializing', initialisingEventHandler)
    polygonIdManager.on('downloading', downloadingEventHandler)
    return () => {
      polygonIdManager.off('initializing', initialisingEventHandler)
      polygonIdManager.off('downloading', downloadingEventHandler)
    }
  }, [initialisingEventHandler, downloadingEventHandler])

  const handleQRCodeData = useCallback(
    async (qrCodeData: string) => {
      // TODO: Remove testing code when implemented
      // const data = polygonIdManager.decodeQRCode(testRequests.connect)
      const data = polygonIdManager.decodeQRCode(qrCodeData)

      switch (data.type) {
        case 'https://iden3-communication.io/authorization/1.0/request':
          // Either a Connection request or a ZK Proof request
          if (data.body.scope && qrData.body.scope.length) {
            // We have a scope object implying we need to submit a ZK proof
            navigation.navigate('ProofRequest', {
              connectionName: `${data.hostname} (${data.from})`,
              requestMessage: `Do you want to submit a ZKP with the following data?`,
              data,
              onAccept: async () => {
                try {
                  await polygonIdManager.handleAuthRequest(data)
                  // TODO: define what to do afterwards (confirmation screen?)
                } catch (error: unknown) {
                  Sentry.captureException(error)
                  // TODO: Handle error in UI. Use error.message?
                }
              },
              onDecline: () => {
                if (navigation.canGoBack()) {
                  navigation.goBack()
                }
              },
            })
          } else {
            // We have a generic connection request
            navigation.navigate('ConnectionRequest', {
              connectionName: `${data.hostname} (${data.from})`,
              onAccept: async () => {
                try {
                  await polygonIdManager.handleAuthRequest(data)
                  // TODO: define what to do afterwards (confirmation screen?)
                } catch (error: unknown) {
                  Sentry.captureException(error)
                  // TODO: Handle error in UI. Use error.message?
                }
              },
              onDecline: () => {
                if (navigation.canGoBack()) {
                  navigation.goBack()
                }
              },
            })
          }
          break
        case 'https://iden3-communication.io/credentials/1.0/offer':
          // Offer to save a new ZK credential
          navigation.navigate('IncomingDataRequest', {
            connectionName: `${data.hostname} (${data.from})`,
            requestMessage: `Do you want to accept a ZK credential with the following credential data?`,
            incomingData: [data],
            onAccept: async () => {
              try {
                await polygonIdManager.handleFetch(data)
                // TODO: define what to do afterwards (confirmation screen?)
              } catch (error: unknown) {
                Sentry.captureException(error)
                // TODO: Handle error in UI. Use error.message?
              }
            },
            onDecline: () => {
              if (navigation.canGoBack()) {
                navigation.goBack()
              }
            },
          })
          break
      }
    },
    [navigation]
  )

  return {
    handleQRCodeData,
  }
}

export function PolygonIdProvider({ children }: any) {
  const polygonIdContextValue = usePolygonIdContext()
  return (
    <PolygonIdContext.Provider value={polygonIdContextValue}>
      {children}
    </PolygonIdContext.Provider>
  )
}
