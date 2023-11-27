import type { ProtocolHandler } from 'features/protocols'
import {
  isWalletConnectConnection,
  useWalletConnectContext,
} from 'features/walletConnect'
import { useCallback } from 'react'

export function useWalletConnectProtocolHandler(): ProtocolHandler {
  const { handleQrCodeMessage } = useWalletConnectContext()

  const handleDeepLink = useCallback((_url: string) => {
    // No try/cath needed, as handled by the consumer
    // TODO: The deep link structure may be different than the QR code one
    // if (isWalletConnectConnection(url)) {
    //   // TODO: The deep link structure may be different than the QR code one
    //   handleDeepLink(url)
    //   return true
    // }
    return false
  }, [])

  const handleQrCode = useCallback(
    (qrCodeMessage: string) => {
      // No try/cath needed, as handled by the consumer
      if (isWalletConnectConnection(qrCodeMessage)) {
        handleQrCodeMessage(qrCodeMessage)
        return true
      }
      return false
    },
    [handleQrCodeMessage]
  )

  return {
    handleDeepLink,
    handleQrCode,
  }
}
