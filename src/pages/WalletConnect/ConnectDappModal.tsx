import React, { useMemo, useState } from 'react'
import { Alert, Image, StyleSheet, Text, View } from 'react-native'
import { RINKEBY_CHAIN_ID } from 'wallet-connect/constants'
import { DApp, WalletConnectClientMeta } from 'wallet-connect/types'

import BottomActionsModal from 'components/BottomActionsModal'
import Button from 'components/Button'
import DropDownPicker from 'components/Select'
import { Spacer } from 'components/Spacer'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useReduxState } from 'hooks/useReduxState'

import iconStyle from '../../styles/icon'

type Props = {
  client: WalletConnectClientMeta
  dismissModal: () => void
  connect: (address: string, chainId: number, chain?: DApp['chain']) => void
}

const fullNetworkName = (code: DApp['chain']) => {
  switch (code) {
    case 'ethr':
      return 'Ethereum Rinkeby'
    case 'algo':
      return 'Algorand Testnet'
    default:
      return 'Unknown network'
  }
}

const ConnectDappModal = (props: Props) => {
  const {
    client: { name, icons, url },
    connect,
    dismissModal,
  } = props

  // TODO: cleanup convert main-reducer to typescript
  const walletData = useReduxState((state) => state.main.wallets.data)
  const selectedWallets = useReduxState((state) => state.main.selectedWallet)

  const multiWallets = walletData[selectedWallets]
  const accounts = multiWallets.accounts

  const [selectedWallet, setSelectedWallet] = useState<any>()

  // TODO: remove hardcode for wallets
  const wallets = useMemo(
    () =>
      Object.keys(accounts)
        .reverse() // show ethereum first
        .filter((key) => ['ethr', 'algo'].includes(key))
        .map((key) => ({
          ...accounts[key],
          label: `${accounts[key].address}`,
          flag: fullNetworkName(key as any),
          value: accounts[key].address,
          chainId: accounts[key].chain === 'ethr' ? RINKEBY_CHAIN_ID : 0, // only support Rinkeby for now
        })),
    [accounts]
  )

  return (
    <BottomActionsModal title='WalletConnect' onClose={dismissModal}>
      <View style={styles.container}>
        <Image
          style={iconStyle.large}
          source={{
            uri: icons?.[0],
          }}
        />
        <Spacer height={24} />
        <Text style={styles.title}>{name} wants to connect to your wallet</Text>
        <Spacer height={16} />
        <Text style={styles.url}>{url}</Text>
        <Spacer height={24} />

        <DropDownPicker
          showArrow
          placeholder='Select wallet'
          items={wallets}
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
            onPress={() => {
              if (selectedWallet) {
                connect(
                  selectedWallet.value,
                  selectedWallet.chainId,
                  selectedWallet.chain
                )
              } else {
                Alert.alert('Warning', 'Please select a wallet')
              }
            }}>
            Connect
          </Button>
        </View>
      </View>
    </BottomActionsModal>
  )
}

export default ConnectDappModal

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
})
