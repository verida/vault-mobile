import React, { useMemo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { SUPPORTED_CHAINS } from 'wallet-connect/constants'
import { IChainData, WalletConnectClientMeta } from 'wallet-connect/types'

import { Spacer } from 'components//Spacer'
import BottomActionsModal from 'components/BottomActionsModal'
import Button from 'components/Button'
import DropDownPicker from 'components/Select'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useReduxState } from 'hooks/useReduxState'
import * as actions from 'reduxStore/actions'
import { walletConnectNetworkSelector } from 'reduxStore/selectors'
import InputStyles from 'styles/inputs'

type Props = {
  client: WalletConnectClientMeta
  dismissModal: () => void
  connect: () => void
}

const ConnectDappModal = (props: Props) => {
  const {
    client: { name, icons, url },
    connect,
    dismissModal,
  } = props

  const { chain_id: chainId } = useReduxState(walletConnectNetworkSelector)

  const dispatch = useDispatch()

  const options = useMemo(
    () =>
      SUPPORTED_CHAINS.map((item) => ({
        ...item,
        label: item.name,
        value: item.chain_id,
      })),
    []
  )

  return (
    <BottomActionsModal title='Wallet connect' onClose={dismissModal}>
      <View
        style={{
          flexDirection: 'column',
          padding: 32,
          alignItems: 'center',
        }}>
        <Image
          style={{ width: 80, height: 80 }}
          source={{
            uri: icons?.[0],
          }}
        />
        <Spacer height={32} />
        <Text style={styles.title}>{name} wants to connect to your wallet</Text>
        <Spacer height={16} />
        <Text style={styles.url}>{url}</Text>
        <Spacer height={32} />

        <DropDownPicker
          showArrow
          placeholder='Select network'
          items={options}
          containerStyle={InputStyles.select}
          defaultValue={chainId}
          onChangeItem={(item: IChainData) => {
            dispatch(actions.setWalletConnectNetwork({ network: item }))
          }}
        />

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
            onPress={connect}>
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
    flex: 1,
    alignItems: 'stretch',
    paddingBottom: 30,
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
})
