import * as Sentry from '@sentry/react-native'

import { config } from 'config/environment'

// Re-export Sentry from here so it's easier to import
export { Sentry }

export function initSentry() {
  // TODO: Set up redux integration in Sentry
  // TODO: Set up react-navigation integration in Sentry
  // TODO: Enable performance monitoring
  // TODO: Enable profiling
  // TODO: Double check how it works with code push

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
        // TODO: To remove once all `Sentry.captureException` are replaced by `logger.error`.
        // Until then error handled by `logger.error` will logged twice in the console
        // eslint-disable-next-line no-console
        console.error(hint.originalException)
      }
      return event
    },
    ignoreErrors: [
      // TODO: Add errors to ignore in Sentry
    ],
  })
}
