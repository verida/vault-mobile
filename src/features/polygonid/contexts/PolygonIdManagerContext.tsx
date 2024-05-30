import { Context } from '@verida/client-rn'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import AccountManager from '~/api/AccountManager'
import { config } from '~/config'
import { Logger } from '~/features/telemetry'

import { PolygonIdManager } from '../classes'
import { usePolygonIdCircuits, usePolygonIdWitness } from '../hooks'
import { PolygonIdIdentityConfig } from '../types'
import { getPolygonIdPrivateKey } from '../utils'

const logger = Logger.create('PolygonId')

export const polygonIdTestnetConfig: PolygonIdIdentityConfig = {
  blockchain: config.polygonId.common.blockchain,
  networkId: config.polygonId.testnet.networkId,
  didMethod: config.polygonId.common.didMethod,
  revocationType: config.polygonId.common.revocationType,
  revocationBaseUrl: config.polygonId.testnet.revocationBaseUrl,
}

export const polygonIdMainnetConfig: PolygonIdIdentityConfig = {
  blockchain: config.polygonId.common.blockchain,
  networkId: config.polygonId.mainnet.networkId,
  didMethod: config.polygonId.common.didMethod,
  revocationType: config.polygonId.common.revocationType,
  revocationBaseUrl: config.polygonId.mainnet.revocationBaseUrl,
}

// For the moment we are fixing the Polygon ID network to mainnet but we could adapt it based on the Verida network.
const polygonIdNetwork: 'mainnet' | 'testnet' = 'mainnet'

const polygonIdIdentityConfig =
  polygonIdNetwork === 'mainnet'
    ? polygonIdMainnetConfig
    : polygonIdTestnetConfig

export type PolygonIdManagerContextType = {
  isPolygonIdReady: boolean
  areCircuitsReady: boolean
  isWitnessReady: boolean
  isManagerReady: boolean
  isManagerInitialising: boolean
  isManagerInError: boolean
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
    isManagerInError: false,
    manager: null,
    restartManager: async () => {
      return
    },
  })

export const PolygonIdManagerProvider: React.FC = (props) => {
  const { children } = props

  // TODO: Better handle account switching. For now it's ok as creating or switching identity remount almost the whole app including this provider but it's not a good implementation. We should listen to account changes and restart the manager when the account changes.
  const accountManager = AccountManager.getInstance()
  const account = accountManager.getSelectedAccount()
  const veridaVaultContext = accountManager.context as Context | undefined

  const [isManagerInitialising, setIsManagerInitialising] = useState(false)
  const [isManagerInError, setIsManagerInError] = useState(false)
  const [polygonIdManager, setPolygonIdManager] =
    useState<PolygonIdManager | null>(null)

  const { circuitStorage, areAllCircuitsAvailable } = usePolygonIdCircuits()
  const { calculateWitness, isReady: isWitnessReady } = usePolygonIdWitness()

  const initManager = useCallback(async () => {
    setPolygonIdManager(null)
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
      setIsManagerInError(false)
      const polygonIdPrivateKey = getPolygonIdPrivateKey(account.privateKey)

      const manager = await PolygonIdManager.createManager(
        polygonIdIdentityConfig,
        polygonIdPrivateKey,
        veridaVaultContext,
        circuitStorage,
        calculateWitness
      )
      setPolygonIdManager(manager)
    } catch (error) {
      setIsManagerInError(true)
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
      isWitnessReady,
      isManagerReady: !!polygonIdManager,
      isManagerInitialising,
      isManagerInError,
      manager: polygonIdManager,
      restartManager,
    }),
    [
      areAllCircuitsAvailable,
      isWitnessReady,
      isManagerInitialising,
      isManagerInError,
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
