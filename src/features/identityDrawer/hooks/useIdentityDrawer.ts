import { useContext } from 'react'

import { IdentityDrawerContext } from '../contexts'

export const useIdentityDrawer = () => {
  const contextValue = useContext(IdentityDrawerContext)
  if (contextValue === null) {
    throw new Error(
      'useIdentityDrawer must be used within an IdentityDrawerProvider'
    )
  }
  return contextValue
}
