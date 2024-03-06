import React from 'react'

import { PolygonIdCircuitsProvider } from './PolygonIdCircuitsContext'
import { PolygonIdManagerProvider } from './PolygonIdManagerContext'
import { PolygonIdProtocolProvider } from './PolygonIdProtocolContext'
import { PolygonIdWitnessProvider } from './PolygonIdWitnessContext'

export type PolygonIdProviderProps = {
  children: React.ReactNode
}

export const PolygonIdProvider: React.FunctionComponent<
  PolygonIdProviderProps
> = (props) => {
  const { children } = props

  return (
    <PolygonIdCircuitsProvider>
      <PolygonIdWitnessProvider>
        <PolygonIdManagerProvider>
          <PolygonIdProtocolProvider>{children}</PolygonIdProtocolProvider>
        </PolygonIdManagerProvider>
      </PolygonIdWitnessProvider>
    </PolygonIdCircuitsProvider>
  )
}
