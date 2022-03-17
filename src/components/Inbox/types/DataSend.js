import * as Sentry from '@sentry/react-native'
import { isEmpty } from 'lodash'
import { Content } from 'native-base'
import React, { useState } from 'react'
import { Alert } from 'react-native'

import AccountManager from 'api/AccountManager'
import ErrorModal from 'components/ErrorModal/ErrorModal'

import RequestDetailsLayout from '../RequestDetailsLayout'

function buildErrorMessage(errors) {
  const message = {
    content: 'Failed to save data',
    errors: [],
  }
  if (isEmpty(errors)) {
    return message
  }

  try {
    const errorsList = errors.map((errorsByDataEntry) => {
      return errorsByDataEntry.errors
        .map((error) => {
          return `• ${typeof error === 'string' ? error : error.message}`
        })
        .join('\n')
    })
    message.errors = errorsList

    return message
  } catch (error) {
    Sentry.captureException(error)
    return message
  }
}

export default ({ item, inboxItem, type, navigation }) => {
  const [currentAction, setCurrentAction] = useState(null)
  const [errorMessage, setErrorMessage] = useState({
    content: ''
  })

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
        setErrorMessage(buildErrorMessage(handleResult.errors))
      } else {
        navigation.goBack()
      }
    } catch (e) {
      setErrorMessage(e)
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
      <ErrorModal
        visible={!!errorMessage}
        title={'Failed'}
        message={errorMessage?.content}
        details={errorMessage?.errors}
        onDismiss={() => setErrorMessage(null)}
      />
    </Content>
  )
}
