import { DIDClient } from '@verida/did-client'
import { getNetworkFromDID } from 'features/identities'
import { Logger } from 'features/telemetry'
import { emitter } from 'helpers/emitter'
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

import { useEmitter } from './useEmitter'

const logger = new Logger('Auth')

type AuthContextState = {
  refresh: () => Promise<boolean>
  authenticated: boolean
  loaded: boolean
  switchToAccount: (did: string) => Promise<void>
  isVeridaTeamMember: boolean
  forcedSignOut: () => Promise<boolean>
}

// TODO: should move to context folder
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

  const findDID = useCallback(async () => {
    const selectedAccount = AccountManager.getInstance().getSelectedAccount()
    // try to fetch the DID
    const did = selectedAccount!.did
    const veridaNetwork = getNetworkFromDID(did)
    const didClient = new DIDClient({
      network: veridaNetwork,
    })

    try {
      await didClient.get(did)
    } catch (error) {
      logger.error(error)
      if (
        error instanceof Error &&
        error.message.match(/DID resolution error \(notFound\)/gi)
      ) {
        emitter.emit('IDENTITY_NOT_EXIST', {})
      }
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const selectedAccount = AccountManager.getInstance().getSelectedAccount()
      if (selectedAccount) {
        const network = getNetworkFromDID(selectedAccount.did)
        await AccountManager.getInstance().connect(false, network)
      }
      setLoaded(true)
      setAuthenticated(!!selectedAccount)
      return !!selectedAccount
    } catch (error) {
      logger.error(error)
      // Could not connect to the identity, check if it exists
      findDID()
      return false
    }
  }, [findDID])

  const switchToAccount = useCallback(async (did: string) => {
    setLoaded(false)
    await AccountManager.getInstance().switchToAccount(did)
    setLoaded(true)
  }, [])

  const forcedSignOut = useCallback(async () => {
    setAuthenticated(false)
    return true
  }, [])

  useEmitter(
    'APP_RECOVER_FROM_ERROR',
    async () => {
      init()
    },
    []
  )

  // Account manager initialize
  const init = useCallback(async () => {
    await AccountManager.getInstance().init()
    await refresh()
  }, [refresh])

  useEffect(() => {
    init()
  }, [init])

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
