import 'jest'

import { SupportedCaipNamespace } from 'features/caip/@types'
import { stringifyCaip } from 'features/caip/utils/stringifyCaip'

describe('stringifyCaip', () => {
  it('correctly stringifies caip qualifiers', () => {
    expect(
      stringifyCaip({
        parsedCaipType: {
          address: undefined,
          namespace: SupportedCaipNamespace.EIP_155,
          reference: '1',
        },
        suppressAddressComponent: false,
      })
    ).toBe(`eip155:1`)
    expect(
      stringifyCaip({
        parsedCaipType: {
          address: 'cawfree.eth',
          namespace: SupportedCaipNamespace.EIP_155,
          reference: '1',
        },
        suppressAddressComponent: false,
      })
    ).toBe(`eip155:1:cawfree.eth`)
    expect(
      stringifyCaip({
        parsedCaipType: {
          address: 'cawfree.eth',
          namespace: SupportedCaipNamespace.EIP_155,
          reference: '1',
        },
        suppressAddressComponent: true,
      })
    ).toBe(`eip155:1`)
  })
})
