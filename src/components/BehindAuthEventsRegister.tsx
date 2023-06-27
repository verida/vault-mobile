import { useEventHandlers, useWatchPublicProfileChanges } from 'hooks'
import { FC } from 'react'

// Main place to register and handle app events after the user has authenticated
export const BehindAuthEventsRegister: FC = () => {
  useEventHandlers()
  useWatchPublicProfileChanges()

  return null
}
