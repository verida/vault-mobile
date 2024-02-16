import { Context } from '@verida/client-rn'
import { config } from 'config'
import React, { useEffect, useMemo, useState } from 'react'

import AccountManager from 'api/AccountManager'

import { usePolygonIdWitness } from '../hooks'
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

export type NewPolygonIdManagerContextType =
  | {
      isReady: true
      manager: PolygonIdManager
    }
  | {
      isReady: false
      manager: null
    }

export const NewPolygonIdManagerContext =
  React.createContext<NewPolygonIdManagerContextType>({
    isReady: false,
    manager: null,
  })

export const NewPolygonIdManagerProvider: React.FC = (props) => {
  const { children } = props

  // TODO: Handle account switching
  const accountManager = AccountManager.getInstance()
  const account = accountManager.getSelectedAccount()
  const veridaVaultContext = accountManager.context as Context | undefined

  const [polygonIdManager, setPolygonIdManager] =
    useState<PolygonIdManager | null>(null)

  const { witnessCalculator, isReady: isPolygonIdWitnessReady } =
    usePolygonIdWitness()

  useEffect(() => {
    if (!isPolygonIdWitnessReady) {
      return
    }
    const execute = async () => {
      try {
        if (
          !account ||
          !account.did ||
          !account.privateKey ||
          !veridaVaultContext
        ) {
          logger.warn('No Verida account, cannot create Polygon ID Manager yet')
          return
        }

        const polygonIdPrivateKey = getPolygonIdPrivateKey(account.privateKey)
        const manager = await PolygonIdManager.createManager(
          polygonIdConfig,
          polygonIdPrivateKey,
          veridaVaultContext,
          witnessCalculator
        )
        setPolygonIdManager(manager)
      } catch (error) {
        logger.error(error)
      }
    }

    execute()
  }, [isPolygonIdWitnessReady, account, veridaVaultContext, witnessCalculator])

  const contextValue: NewPolygonIdManagerContextType = useMemo(() => {
    if (!polygonIdManager) {
      return {
        isReady: false,
        manager: null,
      }
    }
    return {
      isReady: true,
      manager: polygonIdManager,
    }
  }, [polygonIdManager])

  return (
    <NewPolygonIdManagerContext.Provider value={contextValue}>
      {children}
    </NewPolygonIdManagerContext.Provider>
  )
}
