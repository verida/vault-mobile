import { WalletConnectContext } from 'contexts/WalletConnectContext'
import { WalletConnectContextv2 } from 'contexts/WalletConnectProviderv2'
import { useContext } from 'react'

export function useWalletConnect() {
  return useContext(WalletConnectContext)
}

export function useWalletConnectv2() {
  return useContext(WalletConnectContextv2)
}
