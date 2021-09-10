import React, { useEffect, useState } from 'react'
import Details from './Details'

import { getVault, getWallet } from '../../api'
import LoadingView from '../LoadingView'

export default () => {
  const [info, setInfo] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const wallet = await getWallet()
      const vault = await getVault()
      const name = await vault.profiles.public.get('name')

      setInfo({
        did: wallet.did,
        name: name,
      })
      setLoading(false)
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
