import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import React from 'react'

import { useTheme } from '~/contexts'
import { navigationLinkingConfiguration } from '~/features/deepLinks'

import { navigationRef } from './RootNavigator'

export type NavigationProviderProps = {
  children: React.ReactNode
}

export const NavigationProvider: React.FunctionComponent<
  NavigationProviderProps
> = (props) => {
  const { children } = props

  const { theme: appTheme } = useTheme()

  const theme: typeof DefaultTheme = {
    dark: false,
    colors: {
      background: appTheme.color.background,
      border: appTheme.color.lightGrey,
      card: appTheme.color.surface,
      notification: appTheme.color.orange,
      primary: appTheme.color.primary,
      text: appTheme.color.onBackground,
    },
  }

  return (
    <NavigationContainer
      linking={navigationLinkingConfiguration}
      ref={navigationRef}
      theme={theme}>
      {children}
    </NavigationContainer>
  )
}
