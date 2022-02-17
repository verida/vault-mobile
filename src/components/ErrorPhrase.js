import React from 'react'

import ModifierStyles from '../styles/modifier'
import Label from './Label'

export default ({ shown, style = {} }) => (
  <Label style={[ModifierStyles.label, ModifierStyles.errorText, style]}>
    {(shown &&
      'That does not appear to be a valid seed phrase that was exported from the Verida Vault, please try again') ||
      null}
  </Label>
)
