import React, { useCallback, useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'

import AccountManager from '~/api/AccountManager'
import { ScreenWrapper } from '~/components'
import Card from '~/components/CardList/Card'
import CustomFlatList, { ITEM_PER_PAGE } from '~/components/CustomFlatList'
import { Logger } from '~/features/telemetry'
import { buildItem } from '~/helpers/inbox'
import { MainStackScreenProps } from '~/navigation/types'

const logger = Logger.create('Pages/Inbox')

export type InboxScreenParams = undefined

type InboxScreenProps = MainStackScreenProps<'Inbox'>

export const InboxScreen: React.FC<InboxScreenProps> = (props) => {
  const { navigation } = props

  const listRef = useRef(null)

  const loadInbox = useCallback(async (skip) => {
    const results: any[] = [] // TODO: Make a better type
    try {
      const vault = AccountManager.getInstance().vault
      if (!vault) {
        return results
      }
      const inboxItems = await vault.inbox.fetchLatest(
        {},
        {
          limit: ITEM_PER_PAGE,
          skip,
        }
      )

      for (let i = 0; i < inboxItems.length; i++) {
        const item = await buildItem(inboxItems[i])
        results.push(item)
      }
    } catch (error) {
      logger.error(error)
    }
    return results
  }, [])

  useEffect(() => {
    navigation.setOptions({
      title: 'Inbox',
    })
  }, [navigation])

  // Initialise component
  useEffect(() => {
    const init = async () => {
      const vault = AccountManager.getInstance().vault
      const messaging = await vault!.inbox.getMessaging() // TODO: Better typing
      const _inbox = await messaging.getInbox()
      const datastore = await _inbox.getInboxDatastore()
      datastore.changes(function () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO: Fix typing
        listRef.current?.refresh()
      })
    }

    init()
  }, [])

  const renderItem = useCallback(({ item }) => {
    return <Card options={item} />
  }, [])

  return (
    <ScreenWrapper>
      <CustomFlatList
        ref={listRef}
        data={[]}
        renderItem={renderItem}
        loadData={loadInbox}
        contentContainerStyle={styles.list}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
  },
})
