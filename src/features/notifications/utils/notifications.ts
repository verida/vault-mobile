import { Logger } from 'features/telemetry'
import { VeridaReceivedMessage } from 'features/verida'
import { get } from 'lodash'
import PushNotification from 'react-native-push-notification'

import { VERIDA_VAULT_CONTEXT_NAME } from 'constants/application'
import { VERIDA_COLOR } from 'constants/color'

import {
  DEFAULT_INBOX_MESSAGE_NOTIFICATION_MESSAGE,
  DEFAULT_INBOX_MESSAGE_NOTIFICATION_TITLE,
  MESSAGE_NOTIFICATION_CHANNEL_ID,
  NOTIFICATION_CATEGORY,
} from '../constants'

const logger = new Logger('Notifications')

const androidNotificationIconStyle = {
  largeIcon: 'ic_launcher',
  color: VERIDA_COLOR,
  smallIcon: 'ic_notification',
}

export function pushNewMessageNotification(message: VeridaReceivedMessage) {
  logger.debug('Display notification for new inbox message', { message })
  PushNotification.localNotification({
    channelId: MESSAGE_NOTIFICATION_CHANNEL_ID,
    title:
      message.sentBy.context &&
      message.sentBy.context !== VERIDA_VAULT_CONTEXT_NAME
        ? `New message from ${get(message, 'sentBy.context')}`
        : DEFAULT_INBOX_MESSAGE_NOTIFICATION_TITLE,
    message: message.message || DEFAULT_INBOX_MESSAGE_NOTIFICATION_MESSAGE,
    userInfo: {
      category: NOTIFICATION_CATEGORY.NEW_INBOX_MESSAGE,
      data: message.message,
    },

    ...androidNotificationIconStyle,
  })
}

export function pushRefreshInboxNotification() {
  logger.debug('Display notification for refresh inbox')
  PushNotification.localNotification({
    channelId: MESSAGE_NOTIFICATION_CHANNEL_ID,
    title: DEFAULT_INBOX_MESSAGE_NOTIFICATION_TITLE,
    message: DEFAULT_INBOX_MESSAGE_NOTIFICATION_MESSAGE,
    userInfo: {
      category: NOTIFICATION_CATEGORY.REFRESH_INBOX,
    },

    ...androidNotificationIconStyle,
  })
}
