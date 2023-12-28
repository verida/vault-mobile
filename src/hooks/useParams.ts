import { useRoute } from '@react-navigation/native'

/**
 * @deprecated most of the time route params are used by the screen component that can get them from its props.
 */
export default function useParams<T extends Record<string, any>>() {
  const { params } = useRoute<{ params: T; key: string; name: string }>()
  return params || ({} as T)
}
