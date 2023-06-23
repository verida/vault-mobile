import { useEventHandlers, useWatchPublicProfileChanges } from 'hooks'
import { FC } from 'react'

// Main place to register and handle app events
export const AppEventsRegister: FC = () => {
  useEventHandlers()
  useWatchPublicProfileChanges()

  return null
}
