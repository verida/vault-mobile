import * as Sentry from '@sentry/react-native'
import { Content } from 'native-base'
import React, { useState } from 'react'
import { Alert } from 'react-native'
import store from "reduxStore"
import AccountManager from 'api/AccountManager'

import RequestDetailsLayout from '../RequestDetailsLayout'

export default ({ item, inboxItem, type, navigation }) => {
  const [currentAction, setCurrentAction] = useState(null)
  const onResultClick = async (result) => {
    try {
      if (result === 'accept') {
        setCurrentAction('accept')
      } else {
        setCurrentAction('decline')
      }
      const vault = store.getState().vault
      await vault.inbox.handleAction(inboxItem, result, {})
      setCurrentAction(null)
      navigation.goBack()
    } catch (e) {
      Alert.alert('Error', 'Cannot sync data now')
      Sentry.captureException(e)
      setCurrentAction(null)
    }
  }

  return (
    <Content>
      <RequestDetailsLayout
        item={item}
        type={type}
        inboxItem={inboxItem}
        onResultClick={onResultClick}
        currentAction={currentAction}>
        {/* Hide details about incoming data for now. <RecordList list={records} /> */}
      </RequestDetailsLayout>
    </Content>
  )
}
