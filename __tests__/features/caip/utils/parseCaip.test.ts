import 'jest'

import { maybeParseCaip } from 'features/caip/utils/parseCaip'

describe('parseCaip', () => {
  it('correctly parses caip strings', () => {
    expect(maybeParseCaip('')).toBe(undefined)
    expect(maybeParseCaip(undefined)).toBe(undefined)
    expect(maybeParseCaip(null)).toBe(undefined)
    expect(maybeParseCaip("This isn't a valid caip.")).toBe(undefined)
    expect(maybeParseCaip('near:testnet')).toEqual({
      address: undefined,
      namespace: 'near',
      reference: 'testnet',
    })
    expect(maybeParseCaip('eip155:5')).toEqual({
      address: undefined,
      namespace: 'eip155',
      reference: '5',
    })
    expect(maybeParseCaip('eip155:5:cawfree.eth')).toEqual({
      address: 'cawfree.eth',
      namespace: 'eip155',
      reference: '5',
    })
  })
})
