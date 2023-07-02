import 'jest'

import { maybeParseCaip } from 'features/caip/utils/parseCaip'

describe('parseCaip', () => {
  it('correctly parses caip strings', () => {
    expect(maybeParseCaip('')).toBe(undefined)
    expect(maybeParseCaip(undefined)).toBe(undefined)
    expect(maybeParseCaip(null)).toBe(undefined)
    expect(maybeParseCaip("This isn't a valid caip.")).toBe(undefined)
    expect(maybeParseCaip('near:testnet')).toEqual({
      protocol: 'near',
      chainId: 'testnet',
    })
    expect(maybeParseCaip('eip155:5')).toEqual({
      protocol: 'eip155',
      chainId: '5',
    })
  })
})
