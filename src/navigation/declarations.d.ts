import { MainStackParams } from 'navigation/types'

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParams {}
  }
}
