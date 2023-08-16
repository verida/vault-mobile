/**
 * Convert a base64 encoded string to a Uint8Array.
 *
 * @param value the value to convert.
 * @returns
 */
export function base64StringToUint8Array(value: string) {
  return Uint8Array.from(window.atob(value), (c) => c.charCodeAt(0));
}

export async function fetchAndDecodeBase64EncodedFile(url: string) {
  const req = await fetch(url); // TODO: handle errors from fetch

  const maybeFileContent = await req.text();

  if (typeof maybeFileContent !== "string" || !maybeFileContent.length)
    throw new Error(
      `Expected string file, encountered "${String(maybeFileContent)}".`
    );

  return base64StringToUint8Array(maybeFileContent); // TODO: Use the utility function from the Polygon ID package instead?
}
