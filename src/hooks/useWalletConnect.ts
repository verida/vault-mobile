import { WalletConnectContext } from 'contexts/WalletConnectContext'
import { useContext } from 'react'

export function useWalletConnect() {
  return useContext(WalletConnectContext)
}
