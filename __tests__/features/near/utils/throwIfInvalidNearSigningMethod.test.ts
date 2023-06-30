import 'jest'

import { NearSigningMethod } from 'features/near/@types'
import { throwIfInvalidNearSigningMethod } from 'features/near/utils/throwIfInvalidNearSigningMethod'
import { $enum } from 'ts-enum-util'

describe('throwIfInvalidNearSigningMethod', () => {
  it('throws for invalid signing methods', () => {
    expect(() => throwIfInvalidNearSigningMethod('this is invalid')).toThrow()

    $enum(NearSigningMethod).forEach((nearSigningMethod) =>
      expect(throwIfInvalidNearSigningMethod(nearSigningMethod)).toBeTruthy()
    )
  })
})
