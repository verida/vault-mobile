import {
  addressAgnosticIsCaipEqual,
  ChainMetadatas,
  getRpcUrlOrThrow,
  NEAR_TESTNET_CAIP,
  ParsedCaipType,
  stringifyCaip,
  SupportedCaipProtocolStandard,
} from 'features/caip'
import { connect, keyStores } from 'near-api-js'

export function getNearNetworkConfig({
  chainMetadatas,
  keystore: keyStore,
  parsedCaipType,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly keystore: keyStores.KeyStore
  readonly parsedCaipType: ParsedCaipType<SupportedCaipProtocolStandard.NEAR>
}): Parameters<typeof connect>[0] & {
  // https://docs.near.org/tools/near-api-js/quick-reference#connect
  readonly explorerUrl: string
} {
  // TODO: If near mainnet URLs are simply "mainnet" we should be okay to remove this
  //       and evaluate the URLs below dynamically.
  // HACK: We must to explicitly code for a NEAR CAIP identifier because
  //       we're forced to hardcode different URLs below.
  if (!addressAgnosticIsCaipEqual(NEAR_TESTNET_CAIP, parsedCaipType))
    throw new Error(
      `Encountered unsupported network, "${stringifyCaip({
        parsedCaipType,
        suppressAddressComponent: true,
      })}".`
    )

  const { chainId: networkId } = parsedCaipType

  return {
    networkId, // i.e. "testnet"
    keyStore,
    nodeUrl: getRpcUrlOrThrow(chainMetadatas, parsedCaipType),
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',

    // HACK: The typing demanded declaration of this value.
    headers: {},
  }
}
