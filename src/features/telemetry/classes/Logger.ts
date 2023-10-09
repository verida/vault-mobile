import type { CaptureContext } from '@sentry/types'
import { config } from 'config'
import { LogLevel, Sentry } from 'features/telemetry'

const levelOrder: LogLevel[] = ['error', 'warn', 'info', 'debug']
const currentLogLevelIndex = levelOrder.indexOf(config.logLevel)

const sentryLevelMapping = {
  error: 'error',
  warn: 'warning',
  info: 'info',
  debug: 'debug',
} as const

/**
 * Custom logger to use the console and/or add a breadcrumb to Sentry.
 *
 * The log level can be configured globally with the environment variable `LOG_LEVEL`.
 *
 * The console will be used if in `__DEV__` mode
 *
 * A Sentry breadcrumb will be added for the 'info' and 'warn' level.
 *
 * For `logger.error`, the error will be captured with `Sentry.captureException`.
 */
export class Logger {
  private readonly category: string

  /**
   * Creates a new instance of the logger.
   *
   * @param category Used to prefix the message in the console. For instance, set "Polygon ID" for everything related to Polygon ID. Note, the category is also pass into the Sentry breadcrumb, so avoid filename and/or function names, stay high level, by feature.
   */
  constructor(category: string) {
    this.category = category
  }

  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>
  ) {
    if (levelOrder.indexOf(level) > currentLogLevelIndex) {
      return
    }

    if (config.sentry.enabled && (level === 'warn' || level === 'info')) {
      Sentry.addBreadcrumb({
        category: this.category,
        level: sentryLevelMapping[level],
        message,
        data,
      })
    }

    if (!config.dev.devMode) {
      // Simply skip `console` if not in dev mode
      return
    }

    const formattedMessage = `${new Date().toISOString()} - [${
      this.category
    }] ${message}`

    // To avoid the 'undefined' being displayed in the console
    if (data) {
      // eslint-disable-next-line no-console
      console[level](formattedMessage, data)
    } else {
      // eslint-disable-next-line no-console
      console[level](formattedMessage)
    }
  }

  public error(error: Error | unknown, captureContext?: CaptureContext) {
    if (config.sentry.enabled) {
      Sentry.captureException(error, {
        ...captureContext,
        tags: {
          // For some reason the `tags` property is not recognise while clearly defined. Not a big deal to ignore the warning given how we use this property here
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...captureContext?.tags,
          feature: this.category,
        },
      })
    }

    if (config.dev.devMode) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  public warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data)
  }

  public info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data)
  }

  public debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data)
  }
}
