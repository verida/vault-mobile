/* eslint-disable no-console */
import type { CaptureContext } from '@sentry/types'
import { config } from 'config'
import { LogLevel, Sentry } from 'features/telemetry'

const levelOrder: LogLevel[] = ['error', 'warn', 'info', 'debug']

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
  // Static properties
  private static currentLevelIndex: number = levelOrder.indexOf(config.logLevel)
  private static hideStackTraces: boolean = config.hideStackTracesInLog
  private static instances = new Map<string, Logger>()

  // Instance properties
  private readonly category: string

  private constructor(category: string) {
    this.category = category
  }

  /**
   * Creates a new instance of the logger.
   *
   * @param category Used to prefix the message in the console. For instance, set "Polygon ID" for everything related to Polygon ID. Note, the category is also pass into the Sentry breadcrumb, so avoid filename and/or function names, stay high level, by feature.
   */
  static create(category: string) {
    if (Logger.instances.has(category)) {
      return Logger.instances.get(category)!
    }
    const logger = new Logger(category)
    Logger.instances.set(category, logger)
    return logger
  }

  static setLogLevel(level: LogLevel) {
    Logger.currentLevelIndex = levelOrder.indexOf(level)
  }

  static setHideStackTraces(hide: boolean) {
    Logger.hideStackTraces = hide
  }

  private formatMessage(message: string) {
    return `${new Date().toISOString()} - [${this.category}] ${message}`
  }

  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error | unknown
  ) {
    if (levelOrder.indexOf(level) > Logger.currentLevelIndex) {
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
      // Skip `console` if not in dev mode
      return
    }

    let formattedMessage = this.formatMessage(message)

    if (error instanceof Error && error.stack && !Logger.hideStackTraces) {
      formattedMessage += `\nStack trace:`
      formattedMessage += `\n${error.stack}`
    }

    const extra = []
    if (data) extra.push(data)

    console[level](formattedMessage, ...extra)

    if (error instanceof Error && error.cause) {
      console.group('Caused by:')
      this.log(
        level,
        error.cause instanceof Error ? error.cause.message : '',
        undefined,
        error.cause
      )
      console.groupEnd()
    }
  }

  public error(error: Error | unknown, sentryCaptureContext?: CaptureContext) {
    if (config.sentry.enabled) {
      Sentry.captureException(error, {
        ...sentryCaptureContext,
        tags: {
          // For some reason the `tags` property is not recognise while clearly defined. Not a big deal to ignore the warning given how we use this property here
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ...sentryCaptureContext?.tags,
          feature: this.category,
        },
      })
    }

    this.log(
      'error',
      error instanceof Error ? error.message : '',
      undefined,
      error
    )
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

  public startTimer(label: string) {
    if (config.dev.devMode) {
      this.debug(`Starting timer: ${label}`)
      console.time(label)
    }
    return () => this.endTimer(label)
  }

  public logTimer(label: string, ...extra: string[]) {
    if (config.dev.devMode) {
      console.timeLog(label, extra)
    }
  }

  public endTimer(label: string) {
    if (config.dev.devMode) {
      console.timeEnd(label)
      this.debug(`Timer ended: ${label}`)
    }
  }

  public table(data: unknown[], properties?: string[]) {
    if (config.dev.devMode) {
      console.table(data, properties)
    }
  }
}
