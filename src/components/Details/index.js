import React, { useEffect, useState } from 'react'
import store from 'reduxStore'
import AccountManager from '../../api/AccountManager'
import LoadingView from '../LoadingView'
import Details from './Details'

export default () => {
  const [info, setInfo] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const name = await store.getState().vault.profiles.public.get('name')
        const did = store.getState().selectedAccount
        console.log("This is did", did)
        setInfo({
          did: did.did,
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
