import React, { useCallback, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { Container } from 'native-base'
//import Search from '../components/Search'; <Search />
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { getVault } from '../api'
import { buildItem } from '../helpers/inbox'
import { setInboxItems } from 'store/general/actions'
import CustomFlatList, { ITEM_PER_PAGE } from 'components/CustomFlatList'
import Card from 'components/CardList/Card'
import { StyleSheet } from 'react-native'

const Inbox = () => {
  const listRef = useRef(null)
  const loadInbox = useCallback(async (skip) => {
    try {
      const vault = await getVault()
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
      console.log(error)
    }
  }, [])

  // Initialise component
  useEffect(() => {
    const init = async () => {
      const vault = await getVault()
      vault.veridaApp.inbox.on('inboxChange', function () {
        listRef.current?.refresh()
      })
      vault.veridaApp.inbox.on('newMessage', function () {
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

const mapDispatchToProps = (dispatch) => {
  return {
    setInboxItems: (data) => dispatch(setInboxItems(data)),
  }
}

const mapStateToProps = (state) => {
  return { setInboxItems: state.setInboxItems }
}

export default connect(mapStateToProps, mapDispatchToProps)(Inbox)
