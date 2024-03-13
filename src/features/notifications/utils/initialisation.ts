import PushNotificationIOS from '@react-native-community/push-notification-ios'
import messaging from '@react-native-firebase/messaging'
import { Logger } from 'features/telemetry'
import { PermissionsAndroid, Platform } from 'react-native'
import PushNotification, { Importance } from 'react-native-push-notification'

import { navigate } from 'navigation/RootNavigator'

import {
  MESSAGE_NOTIFICATION_CHANNEL_DESCRIPTION,
  MESSAGE_NOTIFICATION_CHANNEL_ID,
  MESSAGE_NOTIFICATION_CHANNEL_NAME,
  NOTIFICATION_CATEGORY,
} from '../constants'
import { pushRefreshInboxNotification } from './notifications'

const logger = Logger.create('Notifications')

export async function initNotifications() {
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: MESSAGE_NOTIFICATION_CHANNEL_ID, // (required)
        channelName: MESSAGE_NOTIFICATION_CHANNEL_NAME, // (required)
        channelDescription: MESSAGE_NOTIFICATION_CHANNEL_DESCRIPTION,
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
      },
      (_created) => ({}) // (optional) callback returns whether the channel was created, false means it already existed.
    )
  }
  if (Platform.OS === 'ios') {
    // Ensure the badge is not display until we define what to do with it.
    PushNotificationIOS.setApplicationIconBadgeNumber(0)
  }

  PushNotification.configure({
    onRegister: function (token) {
      logger.info('Notification successfully registered')
      logger.debug('Push Notification token', { token })
    },

    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: function (notification) {
      logger.debug('Handling notification opened', { notification })
      try {
        const { data } = notification
        // TODO: handle remote notification

        // process the notification
        switch (data.category) {
          case NOTIFICATION_CATEGORY.NEW_INBOX_MESSAGE:
            navigate('InboxItem', {
              inboxItemId: data.data._id,
            })
            break

          case NOTIFICATION_CATEGORY.REFRESH_INBOX:
            navigate('Inbox', undefined)
            break
        }

        if (Platform.OS === 'ios') {
          // (required) Called when a remote is received or opened, or local notification is opened
          notification.finish(PushNotificationIOS.FetchResult.NoData)

          // Ensure the badge is not display until we define what to do with it.
          PushNotificationIOS.setApplicationIconBadgeNumber(0)
        }
      } catch (error) {
        logger.error(error)
      }
    },

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction: function (_notification) {
      // process the action
      logger.debug('Notification action', { notification: _notification })
    },

    onRegistrationError: function (error) {
      logger.error(
        new Error('Failed to register Notifications', { cause: error })
      )
    },

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    popInitialNotification: true,

    requestPermissions: true,
  })

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    logger.debug('New background message from Firebase', {
      message: remoteMessage,
    })
    // The notification server, via Firebase, only sends ping signaling a new message but doesn't pass the message, for security reasons.
    // The remote message provides the DID of the recipient: remoteMessage.data.did
    // TODO: This handler should not display a generic notification, it should refresh the inbox and the new message listener on the inbox would display a contextual notification.
    // There's an issue with the multi-identity feature, only one is active at a time, so refreshing the inbox would only work for the active identity, which may not be the one of the notification.
    pushRefreshInboxNotification()
  })
}

export async function requestNotificationPermission() {
  if (Platform.OS === 'android') {
    try {
      // Request permission to send notifications
      // iOS has always required asking for permissions, but Android used to not require it, so react-native-push-notification is only requesting for iOS.
      // However, since Android 13, it is required to ask for permission, and as react-native-push-notification is not maintained it still doesn't, so we need to do it ourselves.
      const permissionStatus = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      )
      if (permissionStatus === PermissionsAndroid.RESULTS.GRANTED) {
        logger.info('Notification permission granted')
      } else {
        logger.warn('Notification permission denied')
      }
    } catch (error: unknown) {
      logger.error(error)
    }
  }
}
