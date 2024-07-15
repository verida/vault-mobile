import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { Alert } from 'react-native'

import AccountManager from '~/api/AccountManager'
import { InboxEntry } from '~/api/VaultCommon/interfaces/inbox/Inbox'
import { DataAction } from '~/api/VaultCommon/managers/inbox/DataAction'
import { Logger } from '~/features/telemetry'
import { MainStackParams } from '~/navigation'

import RequestDetailsLayout from '../RequestDetailsLayout'

const logger = Logger.create('Components/Inbox/types/DatabaseSync')

export interface DataStoreSyncProps {
  item: Record<string, any>
  inboxItem: InboxEntry
  type: Record<string, any>
  navigation: NativeStackNavigationProp<MainStackParams>
}

const DataStoreSync: React.FC<DataStoreSyncProps> = (props) => {
  const { item, inboxItem, type, navigation } = props
  const [currentAction, setCurrentAction] = useState<string | null>(null)

  const onResultClick = async (result: keyof DataAction) => {
    try {
      if (result === 'accept') {
        setCurrentAction('accept')
      } else {
        setCurrentAction('decline')
      }
      const vault = AccountManager.getInstance().vault
      await vault?.inbox.handleAction(inboxItem, result, {})
      setCurrentAction(null)
      navigation.goBack()
    } catch (error) {
      Alert.alert('Error', 'Cannot accept data now')
      logger.error(error)
      setCurrentAction(null)
    }
  }

  return (
    <RequestDetailsLayout
      item={item}
      type={type}
      inboxItem={inboxItem}
      onResultClick={onResultClick}
      currentAction={currentAction}>
      {/* Hide details about incoming data for now. <RecordList list={records} /> */}
    </RequestDetailsLayout>
  )
}

export default DataStoreSync
