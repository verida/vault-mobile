import * as React from 'react'
import { Text } from 'react-native'

export const NumericSpan = React.memo(function NumericSpan({
  text,
}: {
  readonly text: string
}): JSX.Element {
  return <Text children={text} />
})
