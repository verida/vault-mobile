import { VERIDA_DID_REGEXP } from 'features/verida'

/**
 * Check if a string value is a valid Verida DID.
 *
 * @param maybeDid The DID or value to test.
 * @returns `true` if a valid Verida DID, `false` otherwise.
 */
export function isValidVeridaDid(maybeDid: string) {
  return VERIDA_DID_REGEXP.test(maybeDid)
}
