import {
  isBlockchainRequestDeepLink,
  isBlockchainRequestQrCode,
} from 'features/cryptoWallet/utils'
import { ProtocolHandler } from 'features/protocols'
import { useCallback } from 'react'

import { useCryptoWallet } from './useCryptoWallet'

export function useCryptoWalletProtocolHandler(): ProtocolHandler {
  const { handleDeepLinkUrl, handleQrCodeMessage } = useCryptoWallet()

  const handleDeepLink = useCallback(
    (url: string) => {
      // No try/cath needed, as handled by the consumer
      if (isBlockchainRequestDeepLink(url)) {
        handleDeepLinkUrl(url)
        return true
      }
      return false
    },
    [handleDeepLinkUrl]
  )

  const handleQrCode = useCallback(
    (qrCodeMessage: string) => {
      // No try/cath needed, as handled by the consumer
      if (isBlockchainRequestQrCode(qrCodeMessage)) {
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
