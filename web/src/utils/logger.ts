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
    })
  );
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
  warn: logWarn,
  info: logInfo,
  log: logInfo,
  debug: logDebug,
};
