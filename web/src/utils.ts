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

function log(content: unknown, level: "error" | "warn" | "info" | "debug") {
  postMessageToWebView(JSON.stringify({ type: "log", content, level }));
}

function logError(content: unknown) {
  log(content, "error");
}

function logWarn(content: unknown) {
  log(content, "warn");
}

function logInfo(content: unknown) {
  log(content, "info");
}

function logDebug(content: unknown) {
  log(content, "debug");
}

export const logger = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  log: logInfo,
  debug: logDebug,
};
