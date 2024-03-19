import type { ProtocolHandler } from 'features/protocols'
import { useCallback } from 'react'

import { isPolygonIdMessage } from '../utils'
import { usePolygonId } from './usePolygonId'

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
