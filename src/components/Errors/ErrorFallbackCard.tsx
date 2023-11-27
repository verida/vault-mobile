import { useTheme } from 'contexts'
import React, { FC } from 'react'
import { FallbackProps } from 'react-error-boundary'
import { View } from 'react-native'

import Button from 'components/Button'
import { Spacer } from 'components/Spacer'
import { Caption } from 'components/Typography/Caption'
import { Label } from 'components/Typography/Label'

export const ErrorFallbackCard: FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const { theme } = useTheme()
  return (
    <View
      style={{ backgroundColor: theme.color.snow, padding: theme.spacing.l }}>
      <Caption>Something went wrong:</Caption>
      <Label
        numberOfLines={10}
        ellipsizeMode='tail'
        style={{ color: theme.color.orange, lineHeight: 16 }}>
        {error.message}
      </Label>
      <Spacer vertical='l' />
      <Button color='transparent-link' onPress={resetErrorBoundary}>
        Try Again
      </Button>
    </View>
  )
}
