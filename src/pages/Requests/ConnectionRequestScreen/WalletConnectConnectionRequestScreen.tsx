import { getSdkError } from '@walletconnect/utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { AccountId } from 'caip'
import {
  Avatar,
  BottomActionBar,
  RequestDetailProperty,
  RequestDetails,
  RequestMessage,
  StatusInfo,
  Typography,
  useMaybeWalletSelectorButtonProps,
  WalletSelectorButton,
} from 'components'
import {
  getAggregateWalletBannerBalanceResult,
  getCryptoWalletAccountId,
  LegacyCryptoWallet,
  selectCryptoWallet,
  useAggregateWalletBannerBalances,
  useSelectedCryptoWalletId,
  useSelectedMinifiedBlockchainAccounts,
  useVeridaWalletAccountDropdownOptions,
  VeridaWalletAccountOption,
} from 'features/cryptoWallet'
import { reduceProtocols } from 'features/protocols'
import { Logger } from 'features/telemetry'
import {
  getWalletConnectProposalRequiredCaipChainIds,
  useWalletConnectProposalRequiredCaipChainIds,
} from 'features/walletConnect/hooks'
import { createWalletConnectSessionApprovalConfiguration } from 'features/walletConnect/utils'
import { useThemeAwareStyle } from 'hooks'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from 'react-native-vector-icons/Feather'

import { CryptoWalletList } from '~/components/CryptoWallet'
import { useAppDispatch } from '~/reduxStore/types'

import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

import { Web3WalletData } from './types'

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

type ConnectionRequestScreenProps =
  MainStackScreenProps<'WalletConnectConnectionRequest'>

enum PageType {
  ConnectionRequest,
  SelectWallet,
  ConnectionRequestResult,
}

export const WalletConnectConnectionRequestScreen: React.FunctionComponent<
  ConnectionRequestScreenProps
> = (props) => {
  const { navigation, route } = props
  const { name, logo, details, data } = route.params
  const { proposal, web3wallet } = data as Web3WalletData
  const dispatch = useAppDispatch()
  const styles = useThemeAwareStyle(createStyles)

  const selectedCryptoWalletId = useSelectedCryptoWalletId()
  const [processing, setProcessing] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<PageType>(
    PageType.ConnectionRequest
  )

  const [error, setError] = useState(false)
  const [erroMessage, setErrorMessage] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)
  const [previousWalletId, setPreviousWalletId] = useState<string | null>(
    selectedCryptoWalletId
  )

  const pagerRef = useRef<PagerView>(null)
  const insets = useSafeAreaInsets()

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

  const [selectedWallet, setSelectedWallet] = React.useState<
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
      setProcessing(true)
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

      setSuccess(true)
      // setActiveSessions(await web3wallet.getActiveSessions())
      // eslint-disable-next-line no-catch-shadow, @typescript-eslint/no-shadow
    } catch (error) {
      setError(true)
      setErrorMessage(
        `Unable to connect${
          error instanceof Error ? `: ${error.message}` : '.'
        }`
      )
      Alert.alert(
        'Error',
        `Unable to connect${
          error instanceof Error ? `: ${error.message}` : '.'
        }`
      )
      logger.error(error)
    } finally {
      setProcessing(false)
      // InteractionManager.runAfterInteractions(dismissModal)
    }
  }, [selectedWallet, proposal, web3wallet, selectedMinifiedBlockchainAccounts])

  const handleToggleDetails = () => {
    setDetailsOpen((prevValue) => !prevValue)
  }

  const handleWalletSelection = async (item: LegacyCryptoWallet) => {
    dispatch(await selectCryptoWallet(item.id))
  }

  const handleConfirmWalletSelect = () => {
    pagerRef.current?.setPage(PageType.ConnectionRequest)
  }

  const handleWalletSelectorButton = () => {
    setPreviousWalletId(selectedCryptoWalletId)
    pagerRef.current?.setPage(PageType.SelectWallet)
  }

  const handleRejectWalletSelect = useCallback(async () => {
    if (previousWalletId) {
      dispatch(await selectCryptoWallet(previousWalletId))
    }
    pagerRef.current?.setPage(PageType.ConnectionRequest)
  }, [dispatch, previousWalletId])

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

  useEffect(() => {
    setSelectedWallet(wallets?.length === 1 ? wallets[0] : undefined)
  }, [wallets])

  useEffect(() => {
    if (currentPage === PageType.SelectWallet) {
      navigation.setOptions({
        title: 'Select a Wallet',
        headerRight: () => (
          <ButtonNativeBase transparent onPress={handleRejectWalletSelect}>
            <IconNativeBase name='close' style={{ color: '#000' }} />
          </ButtonNativeBase>
        ),
      })
    } else if (currentPage === PageType.ConnectionRequest) {
      navigation.setOptions({
        title: 'Connection Request',
        headerRight: () => (
          <ButtonNativeBase transparent onPress={handleClose}>
            <IconNativeBase name='close' style={{ color: '#000' }} />
          </ButtonNativeBase>
        ),
      })
    }
  }, [navigation, handleRejectWalletSelect, handleClose, currentPage])

  useEffect(() => {
    if ((success || processing || error) && pagerRef.current) {
      pagerRef.current.setPage(PageType.ConnectionRequestResult)
    }
  }, [success, processing, error, pagerRef])

  return (
    <>
      <StatusBar barStyle='light-content' />
      <PagerView
        initialPage={currentPage}
        style={styles.pagerView}
        ref={pagerRef}
        onPageSelected={(e) => {
          setCurrentPage(e.nativeEvent.position)
        }}>
        <View
          key={`ConnectionRequest`}
          style={[
            styles.wrapper,
            {
              paddingBottom: insets.bottom,
              paddingRight: insets.right,
              paddingLeft: insets.left,
            },
          ]}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.containerContent}>
            <Avatar source={logo} fallbackType='person' style={styles.logo} />
            {details.url ? (
              <Typography variant='bodySemiBold' style={styles.url}>
                {details.url}
              </Typography>
            ) : null}
            <Typography
              variant='h2'
              style={styles.connectMessage}>{`Connect to ${name}`}</Typography>
            {details.message ? (
              <RequestMessage style={styles.messageContainer}>
                {details.message}
              </RequestMessage>
            ) : null}

            <TouchableOpacity
              onPress={handleToggleDetails}
              style={styles.detailsButton}>
              <Typography
                variant='bodySemiBold'
                style={styles.detailsButtonLabel}>
                Request details
              </Typography>
              <Feather
                name={detailsOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                style={styles.detailsButtonLabelIcon}
              />
            </TouchableOpacity>

            {detailsOpen ? (
              <RequestDetails
                properties={detailProperties}
                style={styles.detailsContainer}
              />
            ) : null}
            {maybeWalletSelectorButtonProps && (
              <TouchableOpacity
                onPress={handleWalletSelectorButton}
                style={styles.walletSelectorButton}>
                <WalletSelectorButton {...maybeWalletSelectorButtonProps} />
              </TouchableOpacity>
            )}
          </ScrollView>
          <BottomActionBar
            alertType='error'
            actions={[
              {
                label: 'Decline',
                onPress: handleClose,
                color: 'grey',
              },
              {
                label: 'Connect',
                onPress: handleConnect,
              },
            ]}
          />
        </View>
        <View key={`SelectWallet`}>
          <CryptoWalletList
            style={styles.walletListContainer}
            onPressItem={handleWalletSelection}
          />
          <BottomActionBar
            actions={[
              {
                label: 'Confirm Selection',
                onPress: handleConfirmWalletSelect,
                disabled: false,
              },
            ]}
          />
        </View>
        <View key={`ConnectionRequestResult`}>
          <View style={styles.container}>
            <StatusInfo
              style={styles.statusContainer}
              statusType={
                processing ? 'processsing' : success ? 'success' : 'error'
              }
              title={
                processing ? 'Connecting...' : success ? 'Success!' : 'Error!'
              }
              subtitle={
                processing
                  ? 'Please wait a moment, we are securely setting up the connection.'
                  : success
                    ? `You are successfully connected to ${name}.`
                    : erroMessage || 'Something went wrong. Try again later.'
              }
            />
          </View>
          <BottomActionBar
            alertType='error'
            actions={[
              {
                label: 'Done',
                onPress: handleClose,
                disabled: processing,
              },
            ]}
          />
        </View>
      </PagerView>
    </>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pagerView: {
      flex: 1,
    },
    wrapper: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    container: {
      flex: 1,
    },
    containerContent: {
      paddingTop: theme.spacing.xxxxl,
      paddingBottom: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      alignItems: 'center',
    },
    logo: {
      height: 72,
      aspectRatio: 1 / 1,
      borderRadius: theme.roundness.full,
    },
    url: {
      marginTop: theme.spacing.s,
      color: theme.color.textLightGrey,
    },
    connectMessage: {
      marginTop: theme.spacing.sm,
    },
    messageContainer: {
      marginTop: theme.spacing.m,
      width: '100%',
    },
    detailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.m,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: theme.roundness.full,
      borderColor: theme.color.lightGrey,
    },
    detailsButtonLabel: {
      color: theme.color.textLightGrey,
    },
    detailsButtonLabelIcon: {
      marginLeft: theme.spacing.xs,
      color: theme.color.textLightGrey,
    },
    detailsContainer: {
      marginTop: theme.spacing.sm,
      width: '100%',
    },
    statusContainer: {
      marginTop: theme.spacing.xxl,
    },
    walletListContainer: {
      width: '100%',
    },
    walletSelectorButton: {
      marginTop: theme.spacing.sm,
      width: '100%',
    },
  })
