import { postMessageToWebView } from "./webview";

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
