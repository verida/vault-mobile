import * as Sentry from '@sentry/react-native'
import { isEmpty } from 'lodash'
import { Content } from 'native-base'
import React, { useState } from 'react'
import store from "reduxStore"
import AccountManager from 'api/AccountManager'
import ErrorModal from 'components/ErrorModal/ErrorModal'

import RequestDetailsLayout from '../RequestDetailsLayout'

function buildErrorMessage(errors) {
  const message = {
    message: 'Failed to save data',
    details: '',
  }
  if (isEmpty(errors)) {
    return message
  }

  try {
    const errorsList = errors.map((errorsByDataEntry) => {
      return errorsByDataEntry.errors
        .map((error) => {
          return `• ${
            typeof error === 'string' ? error : error.stack || error.message
          }`
        })
        .join('\n')
    })

    message.details = errorsList.join('\n')

    return message
  } catch (error) {
    Sentry.captureException(error)
    return message
  }
}

export default ({ item, inboxItem, type, navigation }) => {
  const [currentAction, setCurrentAction] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const onResultClick = async (result) => {
    try {
      if (result === 'accept') {
        setCurrentAction('accept')
      } else {
        setCurrentAction('decline')
      }
      const vault = store.getState().vault
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
        message={errorMessage?.message}
        details={errorMessage?.details}
        onDismiss={() => setErrorMessage(null)}
      />
    </Content>
  )
}
