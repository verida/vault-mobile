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
  switchToAccount: (did: string) => Promise<void>
}

const AuthContext = createContext<AuthContextState>({
  refresh: async () => false,
  authenticated: false,
  loaded: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  switchToAccount: async () => {},
})

export const AuthProvider: FC = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const authorized = !!AccountManager.getInstance().selectedAccount
    if (authorized) {
      await AccountManager.getInstance().connect()
    }
    setLoaded(true)
    setAuthenticated(authorized)
    return authorized
  }, [])

  const switchToAccount = useCallback(async (did: string) => {
    setLoaded(false)
    await AccountManager.getInstance().switchToAccount(did)
    setLoaded(true)
  }, [])

  const context = useMemo(
    () => ({
      refresh,
      authenticated,
      loaded,
      switchToAccount,
    }),
    [refresh, authenticated, loaded, switchToAccount]
  )

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
