import { MainStackParams, TabsScreenParams } from '~/navigation/types'

export type HomeScreenGettingStartedItem = {
  key: string
  label: string
  icon: React.ReactElement
  screen: keyof MainStackParams | keyof TabsScreenParams
  params?: Record<string, unknown>
}
