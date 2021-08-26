import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Text from '../Text'

import History from './History'
import EmptyList from '../Lists/EmptyList'
import { getVeridaApp } from '../../api'

export default ({ route }) => {
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const veridaApp = await getVeridaApp()
      const datastore = await veridaApp.openDatastore(
        'https://schemas.verida.io/auth/loginRequest/schema.json'
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
