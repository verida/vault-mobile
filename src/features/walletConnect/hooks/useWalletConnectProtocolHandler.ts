import type { ProtocolHandler } from 'features/protocols'
import {
  isWalletConnectConnection,
  useWalletConnectContext,
} from 'features/walletConnect'
import { useCallback } from 'react'

export function useWalletConnectProtocolHandler(): ProtocolHandler {
  const { handleQrCodeMessage } = useWalletConnectContext()

  const handleDeepLink = useCallback(
    (url: string) => {
      // No try/cath needed, as handled by the consumer
      // TODO: The deep link structure may be different than the QR code one
      if (!isWalletConnectConnection(url)) return false

      // TODO: This is a misnomer. Why do we have different handlers for QR codes and URLs?
      handleQrCodeMessage(url)

      return true
    },
    [handleQrCodeMessage]
  )

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
