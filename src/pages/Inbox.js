import { Logger } from 'features/telemetry'
import { Container } from 'native-base'
import React, { useCallback, useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'

import AccountManager from 'api/AccountManager'
import Card from 'components/CardList/Card'
import CustomFlatList, { ITEM_PER_PAGE } from 'components/CustomFlatList'
//import Search from '../components/Search'; <Search />
import NavigationHeader from 'components/Navigation/NavigationHeader'

import { buildItem } from '../helpers/inbox'

const logger = Logger.create('Pages/Inbox')

const Inbox = () => {
  const listRef = useRef(null)
  const loadInbox = useCallback(async (skip) => {
    try {
      const vault = AccountManager.getInstance().vault
      const inboxItems = await vault.inbox.fetchLatest(
        {},
        {
          limit: ITEM_PER_PAGE,
          skip,
        }
      )
      const results = []
      for (let i = 0; i < inboxItems.length; i++) {
        let item = await buildItem(inboxItems[i])
        results.push(item)
      }

      return results
    } catch (error) {
      logger.error(error)
    }
  }, [])

  // Initialise component
  useEffect(() => {
    const init = async () => {
      const vault = AccountManager.getInstance().vault
      const messaging = await vault.inbox.getMessaging()
      const _inbox = await messaging.getInbox()
      const datastore = await _inbox.getInboxDatastore()
      datastore.changes(function () {
        listRef.current?.refresh()
      })
    }

    init()
  }, [loadInbox])

  const renderItem = useCallback(({ item }) => {
    return <Card options={item} />
  }, [])

  return (
    <Container>
      <NavigationHeader title='Inbox' />
      <CustomFlatList
        ref={listRef}
        renderItem={renderItem}
        loadData={loadInbox}
        contentContainerStyle={styles.list}
      />
    </Container>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
  },
})
export default Inbox
