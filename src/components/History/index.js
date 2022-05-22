import * as Sentry from '@sentry/react-native'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import AccountManager from '../../api/AccountManager'
import EmptyList from '../Lists/EmptyList'
import Text from '../Text'
import History from './History'
import store from 'reduxStore'

export default ({ route }) => {
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const veridaApp = store.getState().veridaContext
        const datastore = await veridaApp.openDatastore(
          'https://vault.schemas.verida.io/auth/loginRequest/v0.1.0/schema.json'
        )
        const filter = {
          approved: route.key === 'approved',
        }
        const requests = await datastore.getMany(filter, {
          sort: [{ insertedAt: 'desc' }],
        })

        const _history = requests.length && (
          <View style={style.container}>
            {requests.map((item) => (
              <History key={item._id} data={item} />
            ))}
          </View>
        )

        setHistory(_history)
        setLoading(false)
      } catch (e) {
        Sentry.captureException(e)
      }
    }

    init()
  }, [route.key])

  return loading ? (
    <View style={style.container}>
      <Text>Loading...</Text>
    </View>
  ) : (
    history || <EmptyList type={route.key} />
  )
}

const style = StyleSheet.create({
  container: {
    marginTop: 24,
    marginHorizontal: 20,
  },
})
