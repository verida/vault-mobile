import React, { useEffect } from 'react'

import { ScreenWrapper } from '~/components'
import { AuthStackScreenProps } from '~/navigation/types'

import { CreatePin } from './CreatePin'

export type CreatePinScreenParams = undefined

export type CreatePinScreenProps = AuthStackScreenProps<'CreatePin'>

export const CreatePinScreen: React.FC<CreatePinScreenProps> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    })
  }, [navigation])

  return (
    <ScreenWrapper allSafeAreaEdges>
      <CreatePin />
    </ScreenWrapper>
  )
}
