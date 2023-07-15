import { useProtocols } from 'features/protocols'
import { useEffect } from 'react'
import { Linking } from 'react-native'

export function useDeepLinksHandler() {
  const { processDeepLink } = useProtocols()

  useEffect(() => {
    const getUrl = async () => {
      // No need to try/catch has handled in processDeepLink and Linking.getInitialURL is assumed to not throw errors
      const url = await Linking.getInitialURL()
      if (url) {
        processDeepLink(url)
        // TODO: When all deep links are handled by this protocol handlers, get the result of the process, and if not processed, display something to the user.
      }
    }
    getUrl()
  }, [processDeepLink])

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      // No need to try/catch has handled in processDeepLink
      processDeepLink(url)
      // TODO: When all deep links are handled by this protocol handlers, get the result of the process, and if not processed, display something to the user.
    }
    const subscriber = Linking.addEventListener('url', handleDeepLink)
    return () => {
      subscriber?.remove()
    }
  }, [processDeepLink])
}
