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
        console.debug('[useCreatePolygonIdManager] start init')
        console.debug(
          '[useCreatePolygonIdManager] polygonIsLoading:',
          polygonIsLoading
        )
        if (polygonIsLoading) {
          console.debug(
            '[useCreatePolygonIdManager] polygonIsLoading, so exit wihtout creating manager'
          )
          return
        }

        console.debug('[useCreatePolygonIdManager] creating manager')
        const managerId = await createIdManager(config)
        console.debug(
          '[useCreatePolygonIdManager] manager created with id:',
          managerId
        )

        console.debug('[useCreatePolygonIdManager] updating state')

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
