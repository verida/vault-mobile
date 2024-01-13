import { useRoute } from '@react-navigation/native'

/**
 * @deprecated should use the navigation props from the screen
 */
export default function useParams<T extends Record<string, any>>() {
  const { params } = useRoute<{ params: T; key: string; name: string }>()
  return params || ({} as T)
}
