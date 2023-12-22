import { Logger } from 'ethers/lib/utils'
import { Container } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { connect } from 'react-redux'

import AccountManager from 'api/AccountManager'
import TypeGenericMessage from 'components/Inbox/types/GenericMessage'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import TypeDatabaseSync from '../components/Inbox/types/DatabaseSync'
import TypeDataRequest from '../components/Inbox/types/DataRequest'
import TypeDataSend from '../components/Inbox/types/DataSend'
import TypeDatastoreSync from '../components/Inbox/types/DatastoreSync'
import { buildItem, findTypeById } from '../helpers/inbox'

const inboxItemComponents = {
  'inbox/type/dataSend': TypeDataSend,
  'inbox/type/dataRequest': TypeDataRequest,
  'inbox/type/datastoreSync': TypeDatastoreSync,
  'inbox/type/databaseSync': TypeDatabaseSync,
  'inbox/type/message': TypeGenericMessage,
}

const getHeaderTitle = (type) => {
  switch (type) {
    case 'inbox/type/dataRequest':
      return 'Data Request'
    default:
      return 'Inbox Message'
  }
}

const logger = new Logger('InboxItem')

// TODO: refactor and convert to Typescript
const InboxItem = (props) => {
  const { inboxItemId } = props.route.params
  const [item, setItem] = useState(null)
  const [inboxItem, setInboxItem] = useState(null)
  const [inboxType, setInboxType] = useState(null)

  // Initialise component
  useEffect(() => {
    const init = async () => {
      try {
        const vault = AccountManager.getInstance().vault
        const inboxItems = await vault.inbox.fetchLatest({ _id: inboxItemId })
        const _inboxItem = inboxItems[0]
        const _item = await buildItem(_inboxItem)
        const _inboxType = findTypeById(_item.type)

        setItem(_item)
        setInboxItem(_inboxItem)
        setInboxType(_inboxType)
      } catch (error) {
        Alert.alert('Info', 'Failed to load message', [
          { onPress: () => props.navigation.goBack() },
        ])
        logger.debug('Failed to load inbox item', { cause: error, inboxItemId })
      }
    }

    setInboxType(findTypeById('inbox/type/dataSend'))
    init()
  }, [inboxItemId, props.navigation])

  return (
    <Container>
      <NavigationHeader title={getHeaderTitle(inboxType?.id)} />
      {!item ? (
        <LoadingView />
      ) : inboxItem ? (
        React.createElement(inboxItemComponents[inboxItem.type], {
          item,
          type: inboxType,
          inboxItem,
          navigation: props.navigation,
        })
      ) : null}
    </Container>
  )
}

const mapDispatchToProps = () => {
  return {}
}

const mapStateToProps = (state) => {
  return {
    setInboxItem: state.inbox.setInboxItem, // TODO: check this screen and the necessity of these states.
    setInboxType: state.inbox.setInboxType,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InboxItem)
