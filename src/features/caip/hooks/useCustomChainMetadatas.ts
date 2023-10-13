import * as React from 'react'

/**
 * Interacts with a Verida datastore to pull all of the chains a user has created into
 * the application. These invariably contain non-default network configurations - such
 * as a user's home node, a test environment, or a new blockchain.
 */
// TODO: This schema is **NOT** final - it is just a proof of concept.
export function useCustomChainMetadatas() {
  const addCustomChain = React.useCallback(async () => {}, [])

  return { addCustomChain }
}
