import 'jest'

import { SupportedCaipProtocolStandard } from 'features/caip/@types'
import { stringifyCaip } from 'features/caip/utils/stringifyCaip'

describe('stringifyCaip', () => {
  it('correctly stringifies caip qualifiers', () => {
    expect(
      stringifyCaip({
        parsedCaipType: {
          address: undefined,
          standard: SupportedCaipProtocolStandard.EIP_155,
          chainId: '1',
        },
        suppressAddressComponent: false,
      })
    ).toBe(`eip155:1`)
    expect(
      stringifyCaip({
        parsedCaipType: {
          address: 'cawfree.eth',
          standard: SupportedCaipProtocolStandard.EIP_155,
          chainId: '1',
        },
        suppressAddressComponent: false,
      })
    ).toBe(`eip155:1:cawfree.eth`)
    expect(
      stringifyCaip({
        parsedCaipType: {
          address: 'cawfree.eth',
          standard: SupportedCaipProtocolStandard.EIP_155,
          chainId: '1',
        },
        suppressAddressComponent: true,
      })
    ).toBe(`eip155:1`)
  })
})
