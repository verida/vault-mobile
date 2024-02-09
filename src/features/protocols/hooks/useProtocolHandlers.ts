import { useCryptoWalletProtocolHandler } from 'features/cryptoWallet'
import { usePolygonIdProtocolHandler } from 'features/polygonid'
import type { ProtocolHandler } from 'features/protocols'
import { useStorybookProtocolHandler } from 'features/storybook'
import { useWalletConnectProtocolHandler } from 'features/walletConnect'
import { useRef } from 'react'

export function useProtocolHandlers() {
  const handlersRef = useRef<ProtocolHandler[]>([])

  // Get handlers from their feature folders
  // A handler is considered synchronous, refactor if needed
  const polygonIdProtocolHandler = usePolygonIdProtocolHandler()
  const cryptoWalletProtocolHandler = useCryptoWalletProtocolHandler()
  const walletConnectProtocolHandler = useWalletConnectProtocolHandler()
  const storybookProtocolHandler = useStorybookProtocolHandler()

  // Add other protocols in the array, by order of priority
  handlersRef.current = [
    walletConnectProtocolHandler,
    cryptoWalletProtocolHandler,
    polygonIdProtocolHandler,
    storybookProtocolHandler,
  ]

  return handlersRef
}
