/**
 * Convert a base64 encoded string to a Uint8Array.
 *
 * @param value the value to convert.
 * @returns
 */
export function base64StringToUint8Array(value: string) {
  return Uint8Array.from(window.atob(value), (c) => c.charCodeAt(0));
}

/**
 * Fetch a file and encode its content to Uint8Array
 *
 * @param url URL of the file
 * @returns the file encoded as Uint8Array
 */
export async function fetchAndDecodeBase64EncodedFile(url: string) {
  return new Promise<Uint8Array>((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          reject(new Error(`Error fetching the circuit ${url}`));
        }
        return response.text();
      })
      .then((fileContent) => {
        if (typeof fileContent !== "string" || !fileContent.length)
          reject(
            new Error(
              `Error with the circuit file, expected a non-empty string, encountered "${String(
                fileContent
              )}".`
            )
          );
        resolve(base64StringToUint8Array(fileContent));
      });
  });
}
