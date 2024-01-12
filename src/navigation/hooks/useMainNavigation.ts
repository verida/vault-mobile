import { NavigationProp, useNavigation } from '@react-navigation/native'

import { MainStackParams } from 'navigation/types'

export function useMainNavigation() {
  return useNavigation<NavigationProp<MainStackParams>>()
}
