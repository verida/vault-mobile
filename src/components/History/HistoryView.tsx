import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import AccountManager from '~/api/AccountManager'
import EmptyList from '~/components/Lists/EmptyList'
import { SegmentData } from '~/components/SegmentControl'
import Text from '~/components/Text'
import { Logger } from '~/features/telemetry'

import { History } from './History'

const logger = Logger.create('Components/History')

export interface HistoryViewProps {
  route: SegmentData
}

export const HistoryView: React.FC<HistoryViewProps> = ({ route }) => {
  const [history, setHistory] = useState<React.JSX.Element | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const init = async () => {
      try {
        const veridaApp = AccountManager.getInstance().context
        const datastore = await veridaApp?.openDatastore(
          'https://vault.schemas.verida.io/auth/loginRequest/v0.1.0/schema.json'
        )
        const filter = {
          approved: route.key === 'approved',
        }
        const requests = await datastore?.getMany(filter, {
          sort: [{ insertedAt: 'desc' }],
        })

        const _history =
          (!!requests?.length && (
            <View style={style.container}>
              {requests.map((item) => (
                <History key={(item as any)._id} data={item} />
              ))}
            </View>
          )) ||
          null

        setHistory(_history)
        setLoading(false)
      } catch (error) {
        logger.error(error)
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
