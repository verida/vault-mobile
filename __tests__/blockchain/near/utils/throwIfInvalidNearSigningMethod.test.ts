import 'jest'

import { NearRpcMethod } from 'blockchain/near/@types'
import { throwIfInvalidNearRpcMethod } from 'blockchain/near/utils/throwIfInvalidNearRpcMethod'
import { $enum } from 'ts-enum-util'

describe('throwIfInvalidNearSigningMethod', () => {
  it('throws for invalid signing methods', () => {
    expect(() => throwIfInvalidNearRpcMethod('this is invalid')).toThrow(
      `"this is invalid" is not a valid near signing method.`
    )

    $enum(NearRpcMethod).forEach((nearSigningMethod) =>
      expect(throwIfInvalidNearRpcMethod(nearSigningMethod)).toBeTruthy()
    )
  })
})
