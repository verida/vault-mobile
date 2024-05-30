import React, { useEffect, useState } from 'react'

import AccountManager from '~/api/AccountManager'
import LoadingView from '~/components/LoadingView'

import Details from './Details'

export default () => {
  const [info, setInfo] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const accountManager = AccountManager.getInstance()
        const name = await accountManager.vault.profiles.public.get('name')

        setInfo({
          did: accountManager.selectedAccount.did,
          name: name,
        })
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }

    init()
  }, [])

  if (loading) {
    return <LoadingView />
  }

  return (
    <>
      <Details title='Name' text={info.name} />
      <Details title='DID' text={info.did} />
    </>
  )
}
