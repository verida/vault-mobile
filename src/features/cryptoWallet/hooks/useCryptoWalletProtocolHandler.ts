import { useCallback } from 'react'

import {
  isCryptoRequestDeepLink,
  isCryptoRequestQrCode,
} from '~/features/cryptoWallet/utils'
import { ProtocolHandler } from '~/features/protocols'

import { useCryptoWallet } from './useCryptoWallet'

export function useCryptoWalletProtocolHandler(): ProtocolHandler {
  const { handleDeepLinkUrl, handleQrCodeMessage } = useCryptoWallet()

  const handleDeepLink = useCallback(
    (url: string) => {
      // No try/cath needed, as handled by the consumer
      if (isCryptoRequestDeepLink(url)) {
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
      if (isCryptoRequestQrCode(qrCodeMessage)) {
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
