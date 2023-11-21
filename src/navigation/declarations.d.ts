import {
  RootStackParams,
  AuthStackParams,
  TabsScreenParams,
  MainStackParams,
} from 'navigation/types'

declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends RootStackParamList,
        AuthStackParams,
        TabsScreenParams,
        MainStackParams {}
  }
}
