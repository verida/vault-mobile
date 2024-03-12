import { Context } from '@verida/client-rn'
import { config } from 'config'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Logger } from '~/features/telemetry'

import AccountManager from 'api/AccountManager'

import { PolygonIdManager } from '../classes'
import { usePolygonIdCircuits, usePolygonIdWitness } from '../hooks'
import { PolygonIdConfig } from '../types'
import { getPolygonIdPrivateKey } from '../utils'

const logger = Logger.create('PolygonId')

export const polygonIdTestnetConfig: PolygonIdConfig = {
  polygonIdBlockchain: config.polygonId.common.blockchain,
  polygonIdDidMethod: config.polygonId.common.didMethod,
  polygonIdIpfsGatewayUrl: config.polygonId.common.ipfsGatewayUrl,
  polygonIdRevocationType: config.polygonId.common.revocationType,
  polygonIdNetworkId: config.polygonId.testnet.networkId,
  polygonIdRevocationBaseUrl: config.polygonId.testnet.revocationBaseUrl,
  polygonIdRpcUrl: config.polygonId.testnet.rpcUrl,
  polygonIdContractAddress: config.polygonId.testnet.contractAddress,
}

export const polygonIdMainnetConfig: PolygonIdConfig = {
  polygonIdBlockchain: config.polygonId.common.blockchain,
  polygonIdDidMethod: config.polygonId.common.didMethod,
  polygonIdIpfsGatewayUrl: config.polygonId.common.ipfsGatewayUrl,
  polygonIdRevocationType: config.polygonId.common.revocationType,
  polygonIdNetworkId: config.polygonId.mainnet.networkId,
  polygonIdRevocationBaseUrl: config.polygonId.mainnet.revocationBaseUrl,
  polygonIdRpcUrl: config.polygonId.mainnet.rpcUrl,
  polygonIdContractAddress: config.polygonId.mainnet.contractAddress,
}

// For the moment we are fixing the Polygon ID network to mainnet but we could adapt it based on the Verida network.
const polygonIdNetwork: 'mainnet' | 'testnet' = 'mainnet'

const polygonIdConfig =
  polygonIdNetwork === 'mainnet'
    ? polygonIdMainnetConfig
    : polygonIdTestnetConfig

export type PolygonIdManagerContextType = {
  isPolygonIdReady: boolean
  areCircuitsReady: boolean
  isWitnessReady: boolean
  isManagerReady: boolean
  isManagerInitialising: boolean
  manager: PolygonIdManager | null
  restartManager: () => Promise<void>
}

export const PolygonIdManagerContext =
  React.createContext<PolygonIdManagerContextType>({
    isPolygonIdReady: false,
    areCircuitsReady: false,
    isWitnessReady: false,
    isManagerReady: false,
    isManagerInitialising: false,
    manager: null,
    restartManager: async () => {
      return
    },
  })

export const PolygonIdManagerProvider: React.FC = (props) => {
  const { children } = props

  // TODO: Handle account switching
  const accountManager = AccountManager.getInstance()
  const account = accountManager.getSelectedAccount()
  const veridaVaultContext = accountManager.context as Context | undefined

  const [isManagerInitialising, setIsManagerInitialising] = useState(false)
  const [polygonIdManager, setPolygonIdManager] =
    useState<PolygonIdManager | null>(null)

  const { circuitStorage, areAllCircuitsAvailable } = usePolygonIdCircuits()
  const { calculateWitness, isReady: isWitnessReady } = usePolygonIdWitness()

  const initManager = useCallback(async () => {
    if (!areAllCircuitsAvailable) {
      logger.debug(
        'Circuits not available, cannot create Polygon ID Manager yet'
      )
      return
    }

    if (!isWitnessReady) {
      logger.debug('Witness not ready, cannot create Polygon ID Manager yet')
      return
    }

    if (
      !account ||
      !account.did ||
      !account.privateKey ||
      !veridaVaultContext
    ) {
      logger.debug('No Verida account, cannot create Polygon ID Manager yet')
      return
    }

    try {
      setIsManagerInitialising(true)
      const polygonIdPrivateKey = getPolygonIdPrivateKey(account.privateKey)

      const manager = await PolygonIdManager.createManager(
        polygonIdConfig,
        polygonIdPrivateKey,
        veridaVaultContext,
        circuitStorage,
        calculateWitness
      )
      setPolygonIdManager(manager)
    } catch (error) {
      logger.error(error)
    } finally {
      setIsManagerInitialising(false)
    }
  }, [
    isWitnessReady,
    areAllCircuitsAvailable,
    account,
    veridaVaultContext,
    circuitStorage,
    calculateWitness,
  ])

  const restartManager = useCallback(async () => {
    setPolygonIdManager(null)
    await initManager()
  }, [initManager])

  useEffect(() => {
    initManager()
  }, [initManager])

  const contextValue: PolygonIdManagerContextType = useMemo(
    () => ({
      isPolygonIdReady:
        areAllCircuitsAvailable && isWitnessReady && !!polygonIdManager,
      areCircuitsReady: areAllCircuitsAvailable,
      isWitnessReady: isWitnessReady,
      isManagerReady: !!polygonIdManager,
      isManagerInitialising: isManagerInitialising,
      manager: polygonIdManager,
      restartManager,
    }),
    [
      areAllCircuitsAvailable,
      isWitnessReady,
      isManagerInitialising,
      polygonIdManager,
      restartManager,
    ]
  )

  return (
    <PolygonIdManagerContext.Provider value={contextValue}>
      {children}
    </PolygonIdManagerContext.Provider>
  )
}
