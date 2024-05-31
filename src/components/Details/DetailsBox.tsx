import React, { useEffect, useState } from 'react'

import AccountManager from '~/api/AccountManager'
import LoadingView from '~/components/LoadingView'

import { Details } from './Details'

export const DetailsBox = () => {
  const [info, setInfo] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const init = async () => {
      try {
        const accountManager = AccountManager.getInstance()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const name = await accountManager?.vault?.profiles?.public.get('name')

        setInfo({
          did: accountManager.getSelectedAccount()?.did,
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

export default DetailsBox
