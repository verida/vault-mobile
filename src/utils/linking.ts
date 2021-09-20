import { Linking } from 'react-native'

export const openUrl = async (url: string) => {
  const canOpen = await Linking.canOpenURL(url)
  if (canOpen) {
    return Linking.openURL(url)
  }
}
