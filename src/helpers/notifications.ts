import PushNotificationIOS from '@react-native-community/push-notification-ios'
import * as Sentry from '@sentry/react-native'
import { Platform } from 'react-native'
import PushNotification, { Importance } from 'react-native-push-notification'
import store from 'reduxStore'

import { navigate } from 'navigation/RootNavigator'
import { setNavigationLink } from 'reduxStore/general/actions'

export const CHANNEL_ID = 'verida-vault'

// Must be outside of any component LifeCycle (such as `componentDidMount`).
export function configureNotifications() {
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: CHANNEL_ID, // (required)
        channelName: 'verida-vault', // (required)
        channelDescription: 'Verida Vault notifications channel', // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (_created) => ({}) // (optional) callback returns whether the channel was created, false means it already existed.
    )
  }

  PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function (_token) {
      // TODO
    },

    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: function (notification) {
      try {
        const { data } = notification
        // TODO: handle remote notification

        // process the notification
        switch (data.category) {
          // TODO: handle other categories
          case 'InboxItem':
            navigate('InboxItem', {
              inboxItemId: data.data._id,
            })
            break

          case 'Inbox':
            store.dispatch(setNavigationLink('/inbox'))
            break
        }

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData)
      } catch (e) {
        Sentry.captureException(e)
      }
    },

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction: function (_notification) {
      // process the action
    },

    // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
    onRegistrationError: function (_err) {
      // TODO
    },

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     * - if you are not using remote notification or do not have Firebase installed, use this:
     *     requestPermissions: Platform.OS === 'ios'
     */
    requestPermissions: Platform.OS === 'ios',
  })
}
