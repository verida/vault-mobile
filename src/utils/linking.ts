import { Linking } from 'react-native'

export const openUrl = async (url: string) => {
  const canOpen = await Linking.canOpenURL(url)
  if (canOpen) {
    return Linking.openURL(url)
  }
}

export const isSupportedDomain = (host: string) => {
  const supportedDomains = ['verida.network', 'verida.io']

  return supportedDomains.some((domain) => host.includes(domain))
}

export const canBeHandledByDeeplink = (path: string) => {
  const supportedPaths = ['request', 'inbox']
  return supportedPaths.includes(path.replaceAll('/', ''))
}
