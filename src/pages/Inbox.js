import React, { useCallback, useEffect, useRef } from 'react'
import { Container } from 'native-base'
//import Search from '../components/Search'; <Search />
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { buildItem } from '../helpers/inbox'
import CustomFlatList, { ITEM_PER_PAGE } from 'components/CustomFlatList'
import Card from 'components/CardList/Card'
import { StyleSheet } from 'react-native'
import AccountManager from 'api/AccountManager'

const Inbox = () => {
  const listRef = useRef(null)
  const loadInbox = useCallback(async (skip) => {
    try {
      const vault = AccountManager.getInstance().vault
      console.log('vault:', vault)
      const inboxItems = await vault.inbox.fetchLatest(
        {},
        {
          limit: ITEM_PER_PAGE,
          skip,
        }
      )
      console.log('inboxItems:', inboxItems)
  
      const results = []
      for (let i = 0; i < inboxItems.length; i++) {
        let item = await buildItem(inboxItems[i])
        results.push(item)
      }
      
      console.log('result:', results)

      return results
    } catch (error) {
      console.log(error)
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
