import { isPolygonIdMessage, usePolygonId } from 'features/polygonid'
import type { ProtocolHandler } from 'features/protocols'
import { useCallback } from 'react'

export function usePolygonIdProtocolHandler(): ProtocolHandler {
  const { handleDeepLinkUrl, handleQRCodeMessage } = usePolygonId()

  const handleDeepLink = useCallback(
    (url: string) => {
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
