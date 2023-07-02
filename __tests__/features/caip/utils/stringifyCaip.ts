import 'jest'

import { stringifyCaip } from 'features/caip/utils/stringifyCaip'

describe('stringifyCaip', () => {
  it('correctly stringifies caip qualifiers', () => {
    expect(
      stringifyCaip({
        address: undefined,
        protocol: 'eip155',
        chainId: '1',
      })
    ).toBe(`eip155:1`)
    expect(
      stringifyCaip({
        address: 'cawfree.eth',
        protocol: 'eip155',
        chainId: '1',
      })
    ).toBe(`eip155:1:cawfree.eth`)
  })
})
