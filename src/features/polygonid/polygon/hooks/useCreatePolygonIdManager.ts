import * as React from 'react'

import { Stateful } from '../../@types'
import { PolygonIdManagerConfig } from '../@types'
import { usePolygonContext } from '../contexts'

const loadingState = (): Stateful<string> => ({
  loading: true,
})

export function useCreatePolygonIdManager(
  config: PolygonIdManagerConfig
): Stateful<string> {
  const [state, setState] = React.useState<Stateful<string>>(loadingState)
  const { createIdManager, loading: polygonIsLoading } = usePolygonContext()

  React.useEffect(() => {
    const init = async () => {
      try {
        setState(loadingState)
        if (polygonIsLoading) {
          return
        }
        const managerId = await createIdManager(config)

        setState({ loading: false, result: managerId })
      } catch (cause) {
        setState({
          loading: false,
          error: new Error('Failed to create PolygonIdManager.', { cause }),
        })
      }
    }
    init()
  }, [createIdManager, config, polygonIsLoading])

  return state
}
