import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import AccountManager from 'api/AccountManager'

type AuthContextState = {
  refresh: () => Promise<boolean>
  authenticated: boolean
  loaded: boolean
  switchToAccount: (did: string) => Promise<void>
  isVeridaTeamMember: boolean
  forcedSignOut: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextState>({
  refresh: async () => false,
  authenticated: false,
  loaded: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  switchToAccount: async () => {},
  isVeridaTeamMember: false,
  forcedSignOut: async () => false,
})

export const AuthProvider: FC = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [isVeridaTeamMember, setVeridaTeamMember] = useState(false)

  useEffect(() => {
    const checkTeamMember = async () => {
      const isTeamMember =
        await AccountManager.getInstance().checkIfVeridaTeamMember()
      setVeridaTeamMember(isTeamMember)
    }

    checkTeamMember()
  }, [loaded])

  const refresh = useCallback(async () => {
    const selectedAccount = AccountManager.getInstance().getSelectedAccount()
    if (selectedAccount) {
      await AccountManager.getInstance().connect()
    }
    setLoaded(true)
    setAuthenticated(!!selectedAccount)
    return !!selectedAccount
  }, [])

  const switchToAccount = useCallback(async (did: string) => {
    setLoaded(false)
    await AccountManager.getInstance().switchToAccount(did)
    setLoaded(true)
  }, [])

  const forcedSignOut = useCallback(async () => {
    setAuthenticated(false)
    return true
  }, [])

  const context = useMemo(
    () => ({
      refresh,
      authenticated,
      loaded,
      switchToAccount,
      isVeridaTeamMember,
      forcedSignOut,
    }),
    [
      refresh,
      authenticated,
      loaded,
      switchToAccount,
      isVeridaTeamMember,
      forcedSignOut,
    ]
  )

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
