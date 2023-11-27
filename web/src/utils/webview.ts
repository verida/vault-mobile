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
