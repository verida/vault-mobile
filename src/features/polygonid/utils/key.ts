/**
 * Generate a Polygon ID private key from a Verida private key.
 *
 * @param veridaPrivateKey
 * @returns The Polygon ID private key
 */
export function getPolygonIdPrivateKey(veridaPrivateKey: string) {
  return veridaPrivateKey.substring(2, 34)
}
