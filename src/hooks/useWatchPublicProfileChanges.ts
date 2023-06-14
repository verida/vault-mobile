import { emitter } from 'helpers/emitter'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import AccountManager from 'api/AccountManager'
import { Account, UserData } from 'api/types'
import {
  getAccountPublicProfile,
  getSelectedAccount,
} from 'reduxStore/selectors'

export function useWatchPublicProfileChanges() {
  const publicProfile: UserData = useSelector(getAccountPublicProfile)
  const account: Account = useSelector(getSelectedAccount)
  const did = account.did

  useEffect(() => {
    let listener: any
    const notifyUpdatePublicProfile = async () => {
      emitter.emit('UPDATE_PUBLIC_PROFILE', undefined)
    }

    const watchPublicProfile = async () => {
      if (!did) return

      // This is a cleaner way to listen for profile data changes event
      // but there is no interface to cancel the listener hence causing a memory leak
      // and having the issue of firing duplication events
      //
      // const client = await AccountManager.getInstance().getClient()
      // const profileConnection = await client?.openPublicProfile(
      //   did,
      //   'Verida: Vault',
      //   'basicProfile'
      // )
      // profileConnection.listen(notifyUpdatePublicProfile)

      // Temporary go with this way
      const vault = AccountManager.getInstance().vault as any
      await vault.profiles.public.init()
      const db = await vault.profiles.public.store.getDb()
      const dbInstance = db.db
      listener = dbInstance
        .changes({
          since: 'now',
          live: true,
        })
        .on('change', notifyUpdatePublicProfile)
    }
    watchPublicProfile()

    return () => {
      listener.off('change', notifyUpdatePublicProfile)
    }
  }, [did])

  return publicProfile
}
