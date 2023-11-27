import { isPolygonIdMessage, usePolygonId } from 'features/polygonid'
import type { ProtocolHandler } from 'features/protocols'
import { useCallback } from 'react'

export function usePolygonIdProtocolHandler(): ProtocolHandler {
  const { handleDeepLinkUrl, handleQRCodeMessage } = usePolygonId()

  const handleDeepLink = useCallback(
    (url: string) => {
      // No try/cath needed, as handled by the consumer
      if (isPolygonIdMessage(url)) {
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
      if (isPolygonIdMessage(qrCodeMessage)) {
        handleQRCodeMessage(qrCodeMessage)
        return true
      }
      return false
    },
    [handleQRCodeMessage]
  )

  return {
    handleDeepLink,
    handleQrCode,
  }
}
