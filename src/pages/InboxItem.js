import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Container, Content } from 'native-base'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { buildItem, findTypeById } from '../helpers/inbox'

import TypeDataSend from '../components/Inbox/types/DataSend'
import TypeDataRequest from '../components/Inbox/types/DataRequest'
import TypeDatastoreSync from '../components/Inbox/types/DatastoreSync'
import TypeDatabaseSync from '../components/Inbox/types/DatabaseSync'
import AccountManager from 'api/AccountManager'

const inboxItemComponents = {
  'inbox/type/dataSend': TypeDataSend,
  'inbox/type/dataRequest': TypeDataRequest,
  'inbox/type/datastoreSync': TypeDatastoreSync,
  'inbox/type/databaseSync': TypeDatabaseSync,
}

const getHeaderTitle = (type) => {
  switch (type) {
    case 'inbox/type/dataRequest':
      return 'Data Request'
    default:
      return 'Inbox Message'
  }
}

const InboxItem = (props) => {
  const { inboxItemId } = props.route.params
  const [item, setItem] = useState(null)
  const [inboxItem, setInboxItem] = useState(null)
  const [inboxType, setInboxType] = useState(null)

  // Initialise component
  useEffect(() => {
    const init = async () => {
      const vault = AccountManager.getInstance().vault
      const inboxItems = await vault.inbox.fetchLatest({ _id: inboxItemId })
      const _inboxItem = inboxItems[0]
      const _item = await buildItem(_inboxItem)
      const _inboxType = findTypeById(_item.type)

      setItem(_item)
      setInboxItem(_inboxItem)
      setInboxType(_inboxType)
    }

    setInboxType(findTypeById('inbox/type/dataSend'))
    init()
  }, [inboxItemId])

  if (!item) {
    return null
  }

  return (
    <Container>
      <NavigationHeader title={getHeaderTitle(inboxType?.id)} />
      <Content>
        {inboxItem
          ? React.createElement(inboxItemComponents[inboxItem.type], {
              item,
              type: inboxType,
              inboxItem,
              navigation: props.navigation,
            })
          : null}
      </Content>
    </Container>
  )
}

const mapDispatchToProps = () => {
  return {}
}

const mapStateToProps = (state) => {
  return { setInboxItem: state.setInboxItem, setInboxType: state.setInboxType }
}

export default connect(mapStateToProps, mapDispatchToProps)(InboxItem)
