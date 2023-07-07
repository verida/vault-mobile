import * as Sentry from '@sentry/react-native'
import { SessionTypes, SignClientTypes } from '@walletconnect/typesv2'
import { getSelectedWalletId, getWallets } from 'features/wallets'
import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { NEAR_CHAIN_TESTNET } from 'wallet-connect/constants'
import { nearAddresses } from 'wallet-connect/helpers/NearWalletUtil'
import { getWC2SignClient } from 'wallet-connect/helpers/SignClient'
import { DApp } from 'wallet-connect/types'

import BottomActionsModal from 'components/BottomActionsModal'
import Button from 'components/Button'
import DropDownPicker, { Option } from 'components/Select'
import { Spacer } from 'components/Spacer'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useReduxState } from 'hooks/useReduxState'
import { approveWalletConnectSessionv2 } from 'reduxStore/actions'
import iconStyle from 'styles/icon'

type Props = {
  proposal: SignClientTypes.EventArguments['session_proposal']
  dismissModal: () => void
}

const fullNetworkName = (code: DApp['chain']) => {
  switch (code) {
    case 'eip155':
      return 'Ethereum Goerli'
    case 'algorand':
      return 'Algorand Testnet'
    case 'near':
      return 'NEAR Testnet'
    default:
      return 'Unknown network'
  }
}

const ConnectDappModalv2 = (props: Props) => {
  const { proposal, dismissModal } = props
  // Get required proposal data
  const { id, params } = proposal
  const { proposer, requiredNamespaces, relays } = params
  const { metadata } = proposer
  const multiWallets = useReduxState(getWallets)
  const walletAccounts = multiWallets.accounts

  const selectedWalletId = useReduxState(getSelectedWalletId)
  const [, setSelectedWallet] = useState<any>()
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const wallets = useMemo(
    () =>
      Object.keys(walletAccounts)
        .filter((key) => Object.keys(requiredNamespaces)?.[0].includes(key))
        // Filter out watched wallets
        .filter(
          (key) =>
            !!walletAccounts[key].mnemonic || !!walletAccounts[key].privateKey
        )
        .map((key) => ({
          ...walletAccounts[key],
          label: `${walletAccounts[key].address}`,
          flag: fullNetworkName(key as any),
          value: walletAccounts[key].address,
          chainId: key,
        })),
    [walletAccounts, requiredNamespaces]
  )

  // Hanlde approve action, construct session namespace
  async function onApprove() {
    if (proposal) {
      try {
        setLoading(true)
        const signClient = await getWC2SignClient()
        const namespaces: SessionTypes.Namespaces = {}
        const firstAccountId = nearAddresses[0]
        Object.keys(requiredNamespaces).forEach((key) => {
          const accounts: string[] = []
          requiredNamespaces[key].chains.forEach((chain) => {
            if (chain === NEAR_CHAIN_TESTNET) {
              accounts.push(`${chain}:${firstAccountId}`)
            }
          })

          namespaces[key] = {
            accounts,
            methods: requiredNamespaces[key].methods,
            events: requiredNamespaces[key].events,
          }
        })
        const { acknowledged, topic } = await signClient.approve({
          id,
          relayProtocol: relays[0].protocol,
          namespaces,
        })
        await acknowledged()

        // Save new dApp to redux store
        dispatch(
          approveWalletConnectSessionv2({
            walletId: selectedWalletId!,
            id, // session id
            topic,
            metadata,
            namespaces,
            relayProtocol: relays[0].protocol,
          })
        )
      } catch (error: any) {
        Sentry.captureException(error)
        Alert.alert('Error', 'Unable to connect: ' + error.message)
      } finally {
        setLoading(false)
        dismissModal()
      }
    }
  }

  // Hanlde reject action
  async function onReject() {
    if (proposal) {
      try {
        setLoading(true)
        const signClient = await getWC2SignClient()
        await signClient.reject({
          id,
          reason: {
            code: 4001,
            message: 'User rejected the request.',
          },
        })
      } catch (error) {
        Sentry.captureException(error)
      } finally {
        setLoading(false)
        dismissModal()
      }
    }
  }

  return (
    <BottomActionsModal
      title='WalletConnect'
      onClose={loading ? dismissModal : onReject}>
      <View style={styles.container}>
        <Image
          style={iconStyle.large}
          source={{
            uri: metadata.icons[0],
          }}
        />
        <Spacer height={24} />
        <Text style={styles.title}>
          {metadata.name} wants to connect to your wallet
        </Text>
        <Spacer height={16} />
        <Text style={styles.url}>{metadata.url}</Text>
        <Spacer height={24} />

        <DropDownPicker
          showArrow
          placeholder='Select wallet'
          items={wallets as Option[]}
          defaultValue={wallets[0].value}
          containerStyle={styles.select}
          onChangeItem={(item: any) => {
            setSelectedWallet(item)
          }}
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
            style={styles.connectButton}
            color='primary'
            onPress={onApprove}>
            Connect
          </Button>
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

export default ConnectDappModalv2

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
