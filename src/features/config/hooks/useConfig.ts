import { useContext } from 'react'

import { ConfigContext } from '../contexts'

export function useConfig() {
  const contextValue = useContext(ConfigContext)
  if (!contextValue) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return contextValue
}
