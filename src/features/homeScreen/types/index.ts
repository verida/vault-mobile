import { MainStackParams, TabsScreenParams } from 'navigation/types'

export type HomeScreenPromotionalBanner = {
  key: string
  buttonLabel: string
  image: any
  screen?: keyof MainStackParams | keyof TabsScreenParams
  link?: string
} & (
  | {
      actionType: 'screen'
      actionValue: keyof MainStackParams | keyof TabsScreenParams
    }
  | {
      actionType: 'link'
      actionValue: string
    }
)

export type HomeScreenGettingStartedItem = {
  key: string
  label: string
  icon: React.ReactElement
  screen: keyof MainStackParams | keyof TabsScreenParams
}
