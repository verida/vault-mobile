import { isEqual } from 'lodash'
import React from 'react'

type UseEffectParams = Parameters<typeof React.useEffect>
type EffectCallback = UseEffectParams[0]
type DependencyList = UseEffectParams[1]

export function useDeepCompareEffect(fn: EffectCallback, deps: DependencyList) {
  const isFirst = React.useRef(true)
  const prevDeps = React.useRef<DependencyList>(deps)

  React.useEffect(() => {
    const isFirstEffect = isFirst.current
    const isSame = prevDeps.current?.every((obj, index) =>
      isEqual(obj, deps![index])
    )

    isFirst.current = false
    prevDeps.current = deps

    if (isFirstEffect || !isSame) {
      return fn()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
