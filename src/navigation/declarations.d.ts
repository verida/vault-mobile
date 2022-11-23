import {RootStackParams, AuthStackParams, DashboardTabParams, MainStackParams} from 'navigation/types'

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList, AuthStackParams, DashboardTabParams, MainStackParams  {}
  }
}