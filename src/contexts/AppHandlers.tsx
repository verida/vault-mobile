import { useDeepLinksHandler } from 'features/deepLinks'
import { useRemoteNotifications } from 'features/notifications'
import { useWatchPublicProfileChanges } from 'features/profiles'
import { useEventHandlers } from 'hooks'
import React from 'react'

/**
 * Main place to declare the app handlers not fitting in any other context
 */
export const AppHandlers: React.FunctionComponent = () => {
  useEventHandlers()
  useWatchPublicProfileChanges()
  useDeepLinksHandler()
  useRemoteNotifications()

  return null
}
