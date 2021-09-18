import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import parse from 'url-parse'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function useDeeplink(navigation: NativeStackNavigationProp<unknown, unknown>) {
  return function (url: string) {
    try {
      const parsedUrl = parse(url, true)
      const { pathname, query } = parsedUrl
      let screenName = ''
      switch (pathname) {
        //TODO: Handle more deeplink thre
        default:
          screenName = 'LoginRequest'
      }
      navigation.navigate(screenName, query)
    } catch (error) {
      console.log(error)
    }
  }
}
