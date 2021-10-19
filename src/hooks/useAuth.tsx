import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import AccountManager from 'api/AccountManager'

type AuthContextState = {
  initialize: () => Promise<boolean>
  authenticated: boolean
  loaded: boolean
}

const AuthContext = createContext<AuthContextState>({
  initialize: async () => false,
  authenticated: false,
  loaded: false,
})

export const AuthProvider: FC = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const initialize = useCallback(async () => {
    console.log('initialize')
    await AccountManager.getInstance().init()
    console.log('initializeed')
    const authorized = !!AccountManager.getInstance().selectedAccount
    setLoaded(true)
    setAuthenticated(authorized)
    return authorized
  }, [])

  const context = useMemo(
    () => ({
      initialize,
      authenticated,
      loaded,
    }),
    [initialize, authenticated, loaded]
  )

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
