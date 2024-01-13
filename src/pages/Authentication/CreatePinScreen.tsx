import React from 'react'

import { AuthStackScreenProps } from 'navigation/types'

import { CreatePin } from './CreatePin'

export type CreatePinScreenParams = undefined

export type CreatePinScreenProps = AuthStackScreenProps<'CreatePin'>

export const CreatePinScreen: React.FC<CreatePinScreenProps> = (_props) => {
  return <CreatePin />
}
