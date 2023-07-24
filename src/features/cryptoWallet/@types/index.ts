import { ChainId } from 'caip'

import { Option } from 'components/Select'

export type VeridaWalletAccountOption = Option & {
  readonly caipChainId: ChainId
}
