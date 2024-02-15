import React from 'react'

import { NewPolygonIdManagerProvider } from './NewPolygonIdManagerContext'
import { PolygonIdProtocolProvider } from './PolygonIdProtocolContext'
import { PolygonIdWitnessProvider } from './PolygonIdWitnessContext'

export type NewPolygonIdProviderProps = {
  children: React.ReactNode
}

export const NewPolygonIdProvider: React.FunctionComponent<NewPolygonIdProviderProps> =
  (props) => {
    const { children } = props

    return (
      <PolygonIdWitnessProvider>
        <NewPolygonIdManagerProvider>
          <PolygonIdProtocolProvider>{children}</PolygonIdProtocolProvider>
        </NewPolygonIdManagerProvider>
      </PolygonIdWitnessProvider>
    )
  }
