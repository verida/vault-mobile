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
  refresh: () => Promise<boolean>
  authenticated: boolean
  loaded: boolean
}

const AuthContext = createContext<AuthContextState>({
  refresh: async () => false,
  authenticated: false,
  loaded: false,
})

export const AuthProvider: FC = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const authorized = !!AccountManager.getInstance().selectedAccount
    setLoaded(true)
    setAuthenticated(authorized)
    return authorized
  }, [])

  const context = useMemo(
    () => ({
      refresh,
      authenticated,
      loaded,
    }),
    [refresh, authenticated, loaded]
  )

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
