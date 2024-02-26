import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { MainStackParams } from 'navigation/types'

export function useMainNavigation() {
  return useNavigation<NativeStackNavigationProp<MainStackParams>>()
}
