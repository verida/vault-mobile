import * as React from 'react'
import { View } from 'react-native'

import { SEPARATOR_LIGHT } from 'constants/color'

export const ChainMetadataListSeparatorComponent = React.memo(() => (
  <View
    style={{
      borderBottomWidth: 1,
      borderBottomColor: SEPARATOR_LIGHT,
    }}
  />
))
