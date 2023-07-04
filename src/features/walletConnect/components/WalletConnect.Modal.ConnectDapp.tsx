import Sentry from '@sentry/react-native'
import { getSdkError } from '@walletconnect/utils'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { Spacer } from 'components'
import { useVeridaWalletAccountDropdownOptions } from 'features/wallet'
import { useMaybeSelectedWallet, useModal } from 'hooks'
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
import { iconStyle } from 'styles'

// TODO: fix imports
import BottomActionsModal from 'components/BottomActionsModal'
// TODO: fix imports
import Button from 'components/Button'
// TODO: fix imports
import DropDownPicker, { Option } from 'components/Select'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

import { WALLETCONNECT_LABEL } from '../constants'

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
  }: {
    readonly proposal: Web3WalletTypes.EventArguments['session_proposal']
    readonly web3wallet: IWeb3Wallet
  }): JSX.Element {
    const [loading, setLoading] = React.useState(false)
    const { dismissModal } = useModal()

    const onReject = React.useCallback(async () => {
      try {
        maybeThrowMissingDependenciesError(proposal, web3wallet)

        setLoading(true)

        await web3wallet.rejectSession({
          id: proposal.id,
          reason: getSdkError('USER_REJECTED_METHODS'),
        })

        // TODO: do we need to update anything here?
      } catch (e) {
        // eslint-disable-next-line no-console
        __DEV__ && console.error(e)
        Sentry.captureException(e)
      } finally {
        setLoading(false)
        InteractionManager.runAfterInteractions(dismissModal)
      }
    }, [dismissModal, proposal, web3wallet])

    const metadata = proposal?.params?.proposer?.metadata

    const maybeSelectedWallet = useMaybeSelectedWallet()

    const wallets: readonly Option[] = useVeridaWalletAccountDropdownOptions({
      includesWatchedWallets: false,
      maybeVeridaWalletAccounts: maybeSelectedWallet?.accounts,
    })

    const [selectedWallet, setSelectedWallet] = React.useState<
      Option | undefined
    >()

    const onApprove = React.useCallback(async () => {
      if (!selectedWallet)
        return Alert.alert('Warning', 'Please select a wallet')

      try {
        maybeThrowMissingDependenciesError(proposal, web3wallet)

        setLoading(true)
      } catch (e) {
        Alert.alert(
          'Error',
          `Unable to connect${e instanceof Error ? `: ${e.message}` : '.'}`
        )
        // eslint-disable-next-line no-console
        __DEV__ && console.error(e)
        Sentry.captureException(e)
      } finally {
        setLoading(false)
        InteractionManager.runAfterInteractions(dismissModal)
      }
    }, [dismissModal, proposal, web3wallet, selectedWallet])

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
          <DropDownPicker
            showArrow
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
              // eslint-disable-next-line react/no-children-prop
              children='Connect'
              style={styles.connectButton}
              color='primary'
              onPress={onApprove}
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
