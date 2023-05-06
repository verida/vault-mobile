import * as React from 'react'

import { CircuitContextValue } from '../@types'
import { CircuitContextProvider } from '../contexts'
import { useCreateEvaluatedCircuitDownloadStates } from '../hooks'

export const CircuitProvider = ({
  children,
  publicDir,
  uri,
}: React.PropsWithChildren<
  Pick<CircuitContextValue, 'uri' | 'publicDir'>
>): JSX.Element => {
  const {
    evaluatedCircuitDownloadStates: circuitDownloadStates,
    assertDownloadState,
  } = useCreateEvaluatedCircuitDownloadStates({ publicDir })

  const value = React.useMemo<CircuitContextValue>(
    // HACK: Save the serialized circuits to the /public directory of the web application.
    () => ({
      publicDir,
      uri,
      circuitDownloadStates,
      assertDownloadState,
    }),
    [uri, publicDir, circuitDownloadStates, assertDownloadState]
  )

  return (
    <CircuitContextProvider value={value}>{children}</CircuitContextProvider>
  )
}
