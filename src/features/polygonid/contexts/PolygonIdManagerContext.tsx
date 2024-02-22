import { Context } from '@verida/client-rn'
import { config } from 'config'
import React, { useEffect, useMemo, useState } from 'react'

import AccountManager from 'api/AccountManager'

import { usePolygonIdCircuits, usePolygonIdWitness } from '../hooks'
import { PolygonIdConfig } from '../types'
import {
  getPolygonIdPrivateKey,
  polygonIdLogger as logger,
  PolygonIdManager,
} from '../utils'

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
  manager: PolygonIdManager | null
}

export const PolygonIdManagerContext =
  React.createContext<PolygonIdManagerContextType>({
    isPolygonIdReady: false,
    areCircuitsReady: false,
    isWitnessReady: false,
    manager: null,
    // TODO: Provide a function reset the manager if anything wrong
  })

export const PolygonIdManagerProvider: React.FC = (props) => {
  const { children } = props

  // TODO: Handle account switching
  const accountManager = AccountManager.getInstance()
  const account = accountManager.getSelectedAccount()
  const veridaVaultContext = accountManager.context as Context | undefined

  const [polygonIdManager, setPolygonIdManager] =
    useState<PolygonIdManager | null>(null)

  const { circuitStorage, areAllCircuitsAvailable } = usePolygonIdCircuits()
  const { calculateWitness, isReady: isWitnessReady } = usePolygonIdWitness()

  useEffect(() => {
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

    const execute = async () => {
      try {
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
      }
    }

    execute()
  }, [
    isWitnessReady,
    areAllCircuitsAvailable,
    account,
    veridaVaultContext,
    circuitStorage,
    calculateWitness,
  ])

  const contextValue: PolygonIdManagerContextType = useMemo(
    () => ({
      isPolygonIdReady:
        areAllCircuitsAvailable && isWitnessReady && !!polygonIdManager,
      areCircuitsReady: areAllCircuitsAvailable,
      isWitnessReady: isWitnessReady,
      manager: polygonIdManager,
    }),
    [areAllCircuitsAvailable, isWitnessReady, polygonIdManager]
  )

  return (
    <PolygonIdManagerContext.Provider value={contextValue}>
      {children}
    </PolygonIdManagerContext.Provider>
  )
}
