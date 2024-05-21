import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { getSdkError } from '@walletconnect/utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { AccountId } from 'caip'
import {
  getAggregateWalletBannerBalanceResult,
  getCryptoWalletAccountId,
  useAggregateWalletBannerBalances,
  useSelectedMinifiedBlockchainAccounts,
  useVeridaWalletAccountDropdownOptions,
  VeridaWalletAccountOption,
} from 'features/cryptoWallet'
import { Logger } from 'features/telemetry'
import {
  getWalletConnectProposalRequiredCaipChainIds,
  useWalletConnectProposalRequiredCaipChainIds,
} from 'features/walletConnect/hooks'
import { createWalletConnectSessionApprovalConfiguration } from 'features/walletConnect/utils'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'

import {
  RequestDetailProperty,
  useMaybeWalletSelectorButtonProps,
} from '~/components'
import { reduceProtocols } from '~/features/protocols'

import { MainStackParams } from 'navigation/types'

import {
  ConnectionRequestScreenParams,
  Web3WalletData,
} from './ConnectionRequestScreen'
import { ConnectionRequestScreenContent } from './ConnectionRequestScreen.Content'

const logger = Logger.create('WalletConnect')

const maybeThrowMissingDependenciesError = (
  proposal: Web3WalletTypes.EventArguments['session_proposal'],
  web3wallet: IWeb3Wallet
) => {
  if (!proposal || !web3wallet)
    throw new Error(
      `Attempted to a reject a proposal, but only received partial dependencies (Proposal?: ${Boolean(
        proposal
      )}, Wallet?: ${Boolean(web3wallet)}).`
    )
}

interface WalletConnectConnectionRequestScreenProps {
  params: ConnectionRequestScreenParams
  data: Web3WalletData
}

export const WalletConnectConnectionRequestScreen: React.FunctionComponent<
  WalletConnectConnectionRequestScreenProps
> = ({ params, data }) => {
  const { proposal, web3wallet } = data
  const { details } = params
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()

  const [processing] = useState(false)
  const [error] = useState(false)
  const [erroMessage] = useState<string | undefined>()
  const [success] = useState(false)

  const selectedMinifiedBlockchainAccounts =
    useSelectedMinifiedBlockchainAccounts()

  const onlyMatchingCaipChainIds =
    useWalletConnectProposalRequiredCaipChainIds(proposal)

  const onlyMatchingNamespaces = React.useMemo(
    () => onlyMatchingCaipChainIds.map((e) => e.namespace),
    [onlyMatchingCaipChainIds]
  )

  const wallets: readonly VeridaWalletAccountOption[] =
    useVeridaWalletAccountDropdownOptions({
      //includesWatchedWallets: false,
      selectedMinifiedBlockchainAccounts,
      onlyMatchingNamespaces,
    })

  const defaultValue = wallets?.length === 1 ? wallets[0] : undefined

  const [selectedWallet] = React.useState<
    VeridaWalletAccountOption | undefined
  >(defaultValue)

  const protocols = reduceProtocols(details.protocols, 16)

  const detailProperties: RequestDetailProperty[] = useMemo(() => {
    const properties = []

    properties.push({
      label: 'Requested on',
      value: (details.timestamp
        ? new Date(details.timestamp)
        : new Date()
      ).toLocaleString(),
    })

    properties.push({
      label: 'From',
      value: details.requesterId,
    })

    properties.push({
      label: 'Via',
      value: <>{protocols}</>,
    })

    return properties
  }, [details.requesterId, details.timestamp, protocols])

  const handleClose = useCallback(async () => {
    try {
      maybeThrowMissingDependenciesError(proposal, web3wallet)

      await web3wallet.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED_METHODS'),
      })
      // eslint-disable-next-line no-catch-shadow, @typescript-eslint/no-shadow
    } catch (error) {
      logger.error(error)
    } finally {
      navigation.goBack()
    }
  }, [navigation, proposal, web3wallet])

  const handleConnect = useCallback(async () => {
    if (!selectedWallet) return Alert.alert('Warning', 'Please select a wallet')

    try {
      maybeThrowMissingDependenciesError(proposal, web3wallet)

      // setLoading(true)

      const { value: minifiedWalletId } = selectedWallet

      // Find the account for the given identifier.
      const matchingAccount = selectedMinifiedBlockchainAccounts.find(
        (minifiedBlockchainAccount) =>
          getCryptoWalletAccountId(minifiedBlockchainAccount) ===
          minifiedWalletId
      )

      if (!matchingAccount)
        throw new Error(
          `Failed to find a matching account for id "${minifiedWalletId}".`
        )

      /// @custom:implicit WalletConnectOnlyAcceptsRequiredChains
      /// @note When we receive a selectedWallet, the returned wallet is abstract in the sense
      //        that it does not relate to a specific chainId. Since we know when we connect using
      //        WalletConnect, we accept *all* required chains only, which is sufficient information
      //        to reconstruct the approvedAccounts property below.
      //  @warn This assumption becomes invalidated if the connection acceptance logic changes.

      const requestedNamespaces = getWalletConnectProposalRequiredCaipChainIds(
        proposal
      ).map((e) => e.toString()) // i.e. ["eip155:5"]

      const { address } = matchingAccount

      const approvedAccounts = requestedNamespaces.map(
        (chainId) =>
          new AccountId({
            chainId,
            address,
          })
      )

      await web3wallet.approveSession(
        createWalletConnectSessionApprovalConfiguration({
          // TODO: We can enable address multiselect in future
          approvedAccounts,
          proposal,
        })
      )

      // setActiveSessions(await web3wallet.getActiveSessions())
      // eslint-disable-next-line no-catch-shadow, @typescript-eslint/no-shadow
    } catch (error) {
      Alert.alert(
        'Error',
        `Unable to connect${
          error instanceof Error ? `: ${error.message}` : '.'
        }`
      )
      logger.error(error)
    } finally {
      // setLoading(false)
      // InteractionManager.runAfterInteractions(dismissModal)
      navigation.goBack()
    }
  }, [
    selectedWallet,
    proposal,
    web3wallet,
    selectedMinifiedBlockchainAccounts,
    navigation,
  ])

  const handleGoToPolygonIdStatus = () => {}

  useEffect(() => {
    navigation.setOptions({
      title: 'Connection Request',
      // TODO: Get rid of the following when properly handling a common header in the navigator
      headerRight: () => (
        // TODO: Get rid of native-base when we have proper base components (button, icon, etc.)
        <ButtonNativeBase transparent onPress={handleClose}>
          <IconNativeBase name='close' style={{ color: '#000' }} />
        </ButtonNativeBase>
      ),
    })
  }, [navigation, handleClose])

  const [maybeAggregateWalletBannerBalance] =
    getAggregateWalletBannerBalanceResult(
      useAggregateWalletBannerBalances({
        resource: onlyMatchingCaipChainIds?.[0],
      })
    )

  const maybeWalletSelectorButtonProps = useMaybeWalletSelectorButtonProps({
    aggregateWalletBannerBalance: maybeAggregateWalletBannerBalance,
    resource: onlyMatchingCaipChainIds?.[0],
  })

  return (
    <>
      <ConnectionRequestScreenContent
        params={params}
        error={error}
        errorMessage={erroMessage}
        processing={processing}
        success={success}
        processButtonDisabled={false}
        detailProperties={detailProperties}
        maybeWalletSelectorButtonProps={maybeWalletSelectorButtonProps}
        handleAlertProcess={handleGoToPolygonIdStatus}
        handleConnect={handleConnect}
        handleReject={handleClose}
      />
    </>
  )
}
