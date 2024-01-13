import { NavigationProp, useNavigation } from '@react-navigation/native'

import { MainStackParams } from 'navigation/types'

/**
 * @deprecated should use the navigation props from the screen as much as possible, or the normal useNavigation exported from 'react-navigation
, which is also properly typed */
export function useMainNavigation() {
  return useNavigation<NavigationProp<MainStackParams>>()
}
