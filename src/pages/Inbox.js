import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Container, Content } from 'native-base'
import Layout from '../components/Layouts/Layout'
//import Search from '../components/Search'; <Search />
import CardList from '../components/CardList'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { getVault } from '../api'
import { buildItem } from '../helpers/inbox'
import { setInboxItems } from 'reduxStore/general/actions'

const Inbox = () => {
  const [inbox, setInbox] = useState([])

  // Initialise component
  useEffect(() => {
    const init = async () => {
      const vault = await getVault()
      vault.veridaApp.inbox.on('inboxChange', function () {
        loadInbox()
      })
      vault.veridaApp.inbox.on('newMessage', function () {
        loadInbox()
      })
    }

    const loadInbox = async () => {
      const vault = await getVault()
      const inboxItems = await vault.inbox.fetchLatest()
      const results = []
      for (let i = 0; i < inboxItems.length; i++) {
        let item = await buildItem(inboxItems[i])
        results.push(item)
      }

      setInbox(results)
    }

    init()
    loadInbox()
  }, [])

  return (
    <Container>
      <NavigationHeader title='Inbox' />
      <Content>
        <Layout>
          <CardList list={inbox} />
        </Layout>
      </Content>
    </Container>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setInboxItems: (data) => dispatch(setInboxItems(data)),
  }
}

const mapStateToProps = (state) => {
  return { setInboxItems: state.setInboxItems }
}

export default connect(mapStateToProps, mapDispatchToProps)(Inbox)
