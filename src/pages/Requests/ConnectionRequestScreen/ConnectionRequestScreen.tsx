import { AuthorizationRequestMessage } from '@0xpolygonid/js-sdk'
import { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import React from 'react'
import { Text, View } from 'react-native'

import { type Protocol } from '~/features/protocols'
import { MainStackScreenProps } from '~/navigation/types'

import { PolygonIDConnectionRequestScreen } from './PolygonIDConnectionRequestScreen'
import { WalletConnectConnectionRequestScreen } from './WalletConnectConnectionRequestScreen'

export type Web3WalletData = {
  web3wallet: IWeb3Wallet
  proposal: Web3WalletTypes.EventArguments['session_proposal']
}

export interface ConnectionRequestScreenParams {
  name: string // TODO: Make it optional and provide a consistent way to representing an unknown requester
  logo?: string
  details: {
    timestamp?: string
    requesterId: string
    message?: string
    url?: string
    protocols: Protocol[]
  }
  data: AuthorizationRequestMessage | Web3WalletData
  // TODO: Make it multiple types for the different protocols
  // TODO: Add expiry when needed
}

type ConnectionRequestScreenProps = MainStackScreenProps<'ConnectionRequest'>

const isWeb3WalletData = (
  data: ConnectionRequestScreenParams['data']
): data is {
  web3wallet: IWeb3Wallet
  proposal: Web3WalletTypes.EventArguments['session_proposal']
} => {
  return (data as { web3wallet: IWeb3Wallet }).web3wallet !== undefined
}

const isAuthorizationRequestMessage = (
  data: ConnectionRequestScreenParams['data']
): data is AuthorizationRequestMessage => {
  return (data as AuthorizationRequestMessage).id !== undefined
}

export const ConnectionRequestScreen: React.FunctionComponent<
  ConnectionRequestScreenProps
> = (props) => {
  const { route } = props
  const { data } = route.params

  if (isWeb3WalletData(data)) {
    return (
      <WalletConnectConnectionRequestScreen data={data} params={route.params} />
    )
  } else if (isAuthorizationRequestMessage(data)) {
    return (
      <PolygonIDConnectionRequestScreen data={data} params={route.params} />
    )
  } else {
    return (
      <View>
        <Text>Unsupported data types</Text>
      </View>
    )
  }
}
