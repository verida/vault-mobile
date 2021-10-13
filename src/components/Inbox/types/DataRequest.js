import React, { useState } from 'react'
import { Content } from 'native-base'
import * as Sentry from '@sentry/react-native'
import { Alert } from 'react-native'
import RequestDetailsLayout from '../RequestDetailsLayout'
import { getVault } from '../../../api'

export default ({ item, inboxItem, type, navigation }) => {
  const [currentAction, setCurrentAction] = useState(null)
  const onResultClick = async (result) => {
    try {
      if (result === 'accept') {
        setCurrentAction('accept')
      } else {
        setCurrentAction('decline')
      }
      const vault = await getVault()
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
        currentAction={currentAction}
      />
    </Content>
  )
}
