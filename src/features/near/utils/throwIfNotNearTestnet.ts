import {
  addressAgnosticIsCaipEqual,
  NEAR_TESTNET_CAIP,
  ParsedCaipType,
  stringifyCaip,
  SupportedCaipProtocolStandard,
} from 'features/caip'

export function throwIfNotNearTestnet(
  parsedCaipType: ParsedCaipType
): parsedCaipType is ParsedCaipType<SupportedCaipProtocolStandard.NEAR> {
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

  return true
}
