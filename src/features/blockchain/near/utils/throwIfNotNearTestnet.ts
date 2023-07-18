import { ChainId } from 'caip'
import { NEAR_TESTNET_CAIP } from 'features/caip'

export function throwIfNotNearTestnet(caipChainId: ChainId) {
  // TODO: If near mainnet URLs are simply "mainnet" we should be okay to remove this
  //       and evaluate the URLs below dynamically.
  // HACK: We must to explicitly code for a NEAR CAIP identifier because
  //       we're forced to hardcode different URLs below.
  if (caipChainId.toString() !== ChainId.format(NEAR_TESTNET_CAIP))
    throw new Error(
      `Encountered unsupported network, "${caipChainId.toString()}".`
    )
}
