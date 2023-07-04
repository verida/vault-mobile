import { ParsedCaipType } from '../@types'

const UNSUPPORTED_CHAIN_FRIENDLY_NAME = 'Unsupported Network'

// TODO: big refactor around the content of WalletsData (i.e. where does information like "Polygon (Mumbai)" come from?
// TODO: namespace and reference is an existing type within verida for ParsedCaipType
// TODO: refactor to use this ^

// TODO: yes this is wrong
function getEip155FriendlyName(chainId: string): string {
  if (chainId === '1') return `Ethereum Mainnet`
  if (chainId === '5') return `Ethereum Goerli`
  if (chainId === '80001') return `Polygon Mumbai`

  return UNSUPPORTED_CHAIN_FRIENDLY_NAME
}

function getNearFriendlyName(chainId: string): string {
  if (chainId === 'testnet') return `NEAR Testnet`

  return UNSUPPORTED_CHAIN_FRIENDLY_NAME
}

// TODO: This is not multichain friendly. Make this a function of the full chain
//       enumerated id.
export function getSupportedCaipProtocolFriendlyName(
  parsedCaipType: ParsedCaipType | null | undefined
): string {
  if (!parsedCaipType) return UNSUPPORTED_CHAIN_FRIENDLY_NAME

  const { protocol, chainId } = parsedCaipType

  // TODO: generalize for supported chains
  // TODO: constants
  if (protocol === 'eip155') return getEip155FriendlyName(chainId)
  else if (protocol === 'near') return getNearFriendlyName(chainId)

  return UNSUPPORTED_CHAIN_FRIENDLY_NAME
}
