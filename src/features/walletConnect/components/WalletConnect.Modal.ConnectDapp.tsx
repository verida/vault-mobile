import { getSdkError } from '@walletconnect/utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { AccountId } from 'caip'
import * as React from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { Spacer } from '~/components'
// TODO: fix imports
import BottomActionsModal from '~/components/BottomActionsModal'
// TODO: fix imports
import Button from '~/components/Button'
// TODO: fix imports
import DropDownPicker from '~/components/Select'
import { NUNITO_SANS_SEMIBOLD } from '~/constants/text'
import {
  getCryptoWalletAccountId,
  useSelectedMinifiedBlockchainAccounts,
  useVeridaWalletAccountDropdownOptions,
  VeridaWalletAccountOption,
} from '~/features/cryptoWallet'
import { Logger } from '~/features/telemetry'
import { ActiveSessions } from '~/features/walletConnect'
import { useModal } from '~/hooks'
import { iconStyle } from '~/styles'

import { WALLETCONNECT_LABEL } from '../constants'
import {
  getWalletConnectProposalRequiredCaipChainIds,
  useWalletConnectProposalRequiredCaipChainIds,
} from '../hooks'
import { createWalletConnectSessionApprovalConfiguration } from '../utils'

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

export const WalletConnectModalConnectDapp = React.memo(
  function WalletConnectModalConnectDapp({
    proposal,
    web3wallet,
    setActiveSessions,
  }: {
    readonly proposal: Web3WalletTypes.EventArguments['session_proposal']
    readonly web3wallet: IWeb3Wallet
    readonly setActiveSessions: React.Dispatch<
      React.SetStateAction<ActiveSessions>
    >
  }): JSX.Element {
    const [loading, setLoading] = React.useState<boolean>(false)
    const { dismissModal } = useModal()

    const onReject = React.useCallback(async () => {
      try {
        maybeThrowMissingDependenciesError(proposal, web3wallet)

        setLoading(true)

        await web3wallet.rejectSession({
          id: proposal.id,
          reason: getSdkError('USER_REJECTED_METHODS'),
        })
      } catch (error) {
        logger.error(error)
      } finally {
        setLoading(false)
        InteractionManager.runAfterInteractions(dismissModal)
      }
    }, [dismissModal, proposal, web3wallet])

    const metadata = proposal?.params?.proposer?.metadata

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

        // HACK: Only show wallets which possess a caip identifier which supports the request.
        //       This prevents us from showing duplicate wallets for a single request, i.e. the
        //       same wallet for Ethereum Goerli and Polygon Mumbai. We could simply filter the
        //       address component, however semantically this could result in a user selecting
        //       the incorrect account for the requested network, which may have consequences
        //       downstream.
        onlyMatchingNamespaces,
      })

    // If there is only a single wallet to choose from, select this by default.
    const defaultValue = wallets?.length === 1 ? wallets[0] : undefined

    const [selectedWallet, setSelectedWallet] = React.useState<
      VeridaWalletAccountOption | undefined
    >(defaultValue)

    const onApprove = React.useCallback(async () => {
      if (!selectedWallet)
        return Alert.alert('Warning', 'Please select a wallet')

      try {
        maybeThrowMissingDependenciesError(proposal, web3wallet)

        setLoading(true)

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

        const requestedNamespaces =
          getWalletConnectProposalRequiredCaipChainIds(proposal).map((e) =>
            e.toString()
          ) // i.e. ["eip155:5"]

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

        setActiveSessions(await web3wallet.getActiveSessions())
      } catch (error) {
        Alert.alert(
          'Error',
          `Unable to connect${
            error instanceof Error ? `: ${error.message}` : '.'
          }`
        )
        logger.error(error)
      } finally {
        setLoading(false)

        InteractionManager.runAfterInteractions(dismissModal)
      }
    }, [
      selectedWallet,
      proposal,
      web3wallet,
      setActiveSessions,
      dismissModal,
      selectedMinifiedBlockchainAccounts,
    ])

    return (
      <BottomActionsModal
        title={WALLETCONNECT_LABEL}
        onClose={loading ? dismissModal : onReject}>
        <View style={styles.container}>
          <Image
            style={iconStyle.large}
            source={{
              // TODO: backup icon image?
              uri: metadata?.icons?.[0],
            }}
          />
          <Spacer height={24} />
          <Text style={styles.title}>
            {metadata?.name} wants to connect to your wallet
          </Text>
          <Spacer height={16} />
          <Text style={styles.url}>{metadata?.url}</Text>
          <Spacer height={24} />
          <DropDownPicker<VeridaWalletAccountOption>
            showArrow
            defaultValue={defaultValue?.value}
            searchableError='No supported wallet'
            placeholder='Select wallet'
            items={wallets}
            containerStyle={styles.select}
            onChangeItem={setSelectedWallet}
          />
          <Spacer height={24} />
          <View style={{ alignItems: 'flex-start' }}>
            <Text style={styles.permission}>
              - View your wallet balance and activity
            </Text>
            <Text style={styles.permission}>
              - Request approval for transactions
            </Text>
          </View>
          <Spacer height={48} />
          <View style={styles.footer}>
            <Button
              children='Connect'
              style={styles.connectButton}
              color='primary'
              onPress={onApprove}
              disabled={!selectedWallet}
            />
          </View>
        </View>
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size={'large'} />
          </View>
        )}
      </BottomActionsModal>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: 32,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    textAlign: 'center',
  },
  permission: {
    fontSize: 14,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    textAlign: 'center',
  },
  url: {
    color: '#8E8E93',
    fontSize: 14,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
  connectButton: {
    alignSelf: 'stretch',
    paddingHorizontal: 24,
  },
  select: {
    height: 60,
    alignItems: 'flex-start',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    opacity: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
