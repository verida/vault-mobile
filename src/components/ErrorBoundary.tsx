import * as Sentry from '@sentry/react-native'
import { useTheme } from 'contexts'
import React, { FC, ReactNode } from 'react'
import {
  ErrorBoundary as ReactErrorBoundary,
  ErrorBoundaryPropsWithFallback,
  FallbackProps,
} from 'react-error-boundary'
import { View } from 'react-native'

import Button from './Button'
import { Caption } from './Typography/Caption'
import { Label } from './Typography/Label'

export interface ErrorBoundaryProps extends ErrorBoundaryPropsWithFallback {
  children?: ReactNode
}

export const genericErrorHandler = (
  error: Error,
  info: { componentStack: string }
) => {
  Sentry.captureException({ ...error, componentStack: info.componentStack })
}

export const GenericErrorFallback: FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const { theme } = useTheme()
  return (
    <View style={{ backgroundColor: theme.color.snow }}>
      <Caption>Something went wrong:</Caption>
      <Label
        numberOfLines={10}
        ellipsizeMode='tail'
        style={{ color: theme.color.orange, lineHeight: 16 }}>
        {error.message}
      </Label>
      <Button color='transparent-link' onPress={resetErrorBoundary}>
        Try Again
      </Button>
    </View>
  )
}

export const ErrorBoundary = ({
  children,
  ...rest
}: Partial<ErrorBoundaryProps>) => {
  return (
    <ReactErrorBoundary
      onError={genericErrorHandler}
      FallbackComponent={GenericErrorFallback}
      {...(rest as any)}>
      {children}
    </ReactErrorBoundary>
  )
}
