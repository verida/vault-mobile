import 'jest'

import { stringifyCaip } from 'features/caip/utils/stringifyCaip'

describe('stringifyCaip', () => {
  it('correctly stringifies caip qualifiers', () => {
    expect(
      stringifyCaip({
        parsedCaipType: {
          address: undefined,
          protocol: 'eip155',
          chainId: '1',
        },
        suppressAddressComponent: false,
      })
    ).toBe(`eip155:1`)
    expect(
      stringifyCaip({
        parsedCaipType: {
          address: 'cawfree.eth',
          protocol: 'eip155',
          chainId: '1',
        },
        suppressAddressComponent: false,
      })
    ).toBe(`eip155:1:cawfree.eth`)
    expect(
      stringifyCaip({
        parsedCaipType: {
          address: 'cawfree.eth',
          protocol: 'eip155',
          chainId: '1',
        },
        suppressAddressComponent: true,
      })
    ).toBe(`eip155:1`)
  })
})
