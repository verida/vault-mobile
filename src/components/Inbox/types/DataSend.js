import * as Sentry from '@sentry/react-native'
import { isEmpty } from 'lodash'
import { Content } from 'native-base'
import React, { useState } from 'react'
import { Alert } from 'react-native'

import AccountManager from 'api/AccountManager'

import RequestDetailsLayout from '../RequestDetailsLayout'

function buildErrorMessage(errors) {
  if (isEmpty(errors)) {
    return 'Failed to save data.'
  }

  const errorsByDataEntries = Object.entries(errors).map(([key, value]) => {
    let message = `${key}:`
    const errorsList = value.map((error) => `• ${error}`)
    return (message += errorsList.join('\n'))
  })

  return errorsByDataEntries.join(`\n`)
}

export default ({ item, inboxItem, type, navigation }) => {
  const [currentAction, setCurrentAction] = useState(null)

  const onResultClick = async (result) => {
    try {
      if (result === 'accept') {
        setCurrentAction('accept')
      } else {
        setCurrentAction('decline')
      }
      const vault = AccountManager.getInstance().vault
      const handleResult = await vault.inbox.handleAction(inboxItem, result, {})
      setCurrentAction(null)
      if (!handleResult.success) {
        Alert.alert('Error', buildErrorMessage(handleResult.errors))
      } else {
        navigation.goBack()
      }
    } catch (e) {
      Alert.alert('Error', 'Cannot accept data now')
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
