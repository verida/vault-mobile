import * as Sentry from '@sentry/react-native'

import { config } from 'config/environment'

export function initSentry() {
  // TODO: Set up redux integration in Sentry
  // TODO: Set up react-navigation integration in Sentry
  // TODO: Enable performance monitoring
  // TODO: Enable profiling
  // TODO: Double check how it works with code push
  // TODO: set the user DID

  Sentry.init({
    enabled: config.sentry.enabled,
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    // release: config.sentry.release, // FIXME: release doesn't seem to be reported, so rollback to how it was ... not set
    // integrations: [],
    // Performance Monitoring
    // tracesSampleRate: config.sentry.tracesSampleRate,
    // Session Replay
    // replaysSessionSampleRate: config.sentry.replaysSessionSampleRate,
    // replaysOnErrorSampleRate: config.sentry.replaysOnErrorSampleRate,
    beforeSend: (event, hint) => {
      if (config.devMode) {
        // TODO: Challenge this versus using the custom Logger (which will provide the category information)
        const error =
          hint?.originalException ||
          JSON.stringify(
            event?.exception ?? { message: 'Unknown error' },
            null,
            2
          )
        // eslint-disable-next-line no-console
        console.error(error) // error will be shown on LogBox and Console
      }
      return event
    },
    ignoreErrors: [
      // TODO: Add errors to ignore in Sentry
    ],
  })
}
