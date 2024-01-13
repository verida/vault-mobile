import { Logger } from 'ethers/lib/utils'
import { buildItem, findTypeById } from 'helpers/inbox'
import { Container } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'

import AccountManager from 'api/AccountManager'
import TypeDatabaseSync from 'components/Inbox/types/DatabaseSync'
import TypeDataRequest from 'components/Inbox/types/DataRequest'
import TypeDataSend from 'components/Inbox/types/DataSend'
import TypeDatastoreSync from 'components/Inbox/types/DatastoreSync'
import TypeGenericMessage from 'components/Inbox/types/GenericMessage'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { MainStackScreenProps } from 'navigation/types'

const inboxItemComponents = {
  'inbox/type/dataSend': TypeDataSend,
  'inbox/type/dataRequest': TypeDataRequest,
  'inbox/type/datastoreSync': TypeDatastoreSync,
  'inbox/type/databaseSync': TypeDatabaseSync,
  'inbox/type/message': TypeGenericMessage,
}

const getHeaderTitle = (type: string) => {
  switch (type) {
    case 'inbox/type/dataRequest':
      return 'Data Request'
    default:
      return 'Inbox Message'
  }
}

const logger = new Logger('InboxItem')

export type InboxItemScreenParams = {
  inboxItemId: string
}

type InboxItemScreenProps = MainStackScreenProps<'InboxItem'>

export const InboxItemScreen: React.FC<InboxItemScreenProps> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const { inboxItemId } = params

  const [item, setItem] = useState<any | null>(null) // TODO: Better typing
  const [inboxItem, setInboxItem] = useState<any | null>(null) // TODO: Better typing
  const [inboxType, setInboxType] = useState<any | null>(null) // TODO: Better typing

  const loadMessage = React.useCallback(async () => {
    try {
      const vault = AccountManager.getInstance().vault
      const inboxItems = await vault!.inbox.fetchLatest({ _id: inboxItemId }) // TODO: Better typing
      const _inboxItem = inboxItems[0]
      const _item = await buildItem(_inboxItem)
      const _inboxType = findTypeById(_item.type)

      setItem(_item)
      setInboxItem(_inboxItem)
      setInboxType(_inboxType)
    } catch (error) {
      Alert.alert('Info', 'Failed to load message', [
        { onPress: () => navigation.goBack() },
      ])
      logger.debug('Failed to load inbox item', { cause: error, inboxItemId })
    }
  }, [inboxItemId, navigation])

  useEffect(() => {
    setInboxType(findTypeById('inbox/type/dataSend'))
    loadMessage()
  }, [loadMessage])

  return (
    <Container>
      <NavigationHeader title={getHeaderTitle(inboxType?.id)} />
      {!item ? (
        <LoadingView />
      ) : inboxItem ? (
        React.createElement(
          inboxItemComponents[
            inboxItem.type as keyof typeof inboxItemComponents
          ],
          {
            item,
            type: inboxType,
            inboxItem,
            navigation: navigation,
          }
        )
      ) : null}
    </Container>
  )
}
