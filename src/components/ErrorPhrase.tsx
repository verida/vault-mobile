import React from 'react'
import { ViewStyle } from 'react-native'

import ModifierStyles from '~/styles/modifier'

import Label from './Label'

export interface ErrorPhraseProps {
  shown: boolean
  style?: ViewStyle
}

const ErrorPhrase: React.FC<ErrorPhraseProps> = (props) => {
  const { shown, style } = props
  return (
    <Label style={[ModifierStyles.label, ModifierStyles.errorText, style]}>
      {(shown &&
        'That does not appear to be a valid seed phrase that was exported from the Verida Vault, please try again') ||
        null}
    </Label>
  )
}

export default ErrorPhrase
