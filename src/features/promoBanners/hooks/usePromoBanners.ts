import { promoBannersApi } from '../redux'

const { useBannersQuery } = promoBannersApi

export function usePromoBanners() {
  const { isLoading, isError, data, error } = useBannersQuery({})

  return {
    promoBanners: data || [],
    isProcessing: isLoading,
    hasError: isError,
    error: error,
  }
}
