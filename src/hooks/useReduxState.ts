import { useSelector } from 'react-redux'

type Result<S> = S extends (...args: any[]) => infer R ? R : any

/**
 * @deprecated look at the useAppSelector hook
 */
export function useReduxState<
  S extends (state: any) => any,
  R extends Result<S>
>(selector: S, equalityFn?: (left: R, right: R) => boolean) {
  return useSelector(selector, equalityFn) as R
}
