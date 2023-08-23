/**
 * Sends a message from the page back to the React Native WebView.
 *
 * @param message the message to send.
 */
export function postMessageToWebView(message: string) {
  // @ts-ignore
  if (window?.ReactNativeWebView) {
    // @ts-ignore
    return window.ReactNativeWebView.postMessage(message);
  }

  // @ts-ignore
  return window?.top?.postMessage?.(
    message,
    // @ts-ignore
    // eslint-disable-next-line eqeqeq
    window.location != window.parent.location
      ? document.referrer
      : document.location
  );
}

function log(
  level: "error" | "warn" | "info" | "debug",
  message: string,
  data?: Record<string, unknown>
) {
  postMessageToWebView(
    JSON.stringify({
      type: "log",
      level,
      message,
      data,
      // data: !!data
      //   ? JSON.stringify(data, Object.getOwnPropertyNames(data))
      //   : undefined,
    })
  );
}

function logError(
  message: string,
  error: Error,
  data?: Record<string, unknown>
) {
  log("error", message, {
    error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    ...data,
  });
}

function logWarn(message: string, data?: Record<string, unknown>) {
  log("warn", message, data);
}

function logInfo(message: string, data?: Record<string, unknown>) {
  log("info", message, data);
}

function logDebug(message: string, data?: Record<string, unknown>) {
  log("debug", message, data);
}

export const logger = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  log: logInfo,
  debug: logDebug,
};
