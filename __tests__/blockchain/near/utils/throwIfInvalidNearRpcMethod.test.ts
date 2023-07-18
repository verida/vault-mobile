import 'jest'

import { NearRpcMethod } from 'features/blockchain/near/@types'
import { throwIfInvalidNearRpcMethod } from 'features/blockchain/near/utils/throwIfInvalidNearRpcMethod'
import { $enum } from 'ts-enum-util'

describe('throwIfInvalidNearRpcMethod', () => {
  it('throws for invalid rpc methods', () => {
    expect(() => throwIfInvalidNearRpcMethod('this is invalid')).toThrow(
      `"this is invalid" is not a valid near RPC method.`
    )
    $enum(NearRpcMethod).forEach((nearRpcMethod) =>
      expect(throwIfInvalidNearRpcMethod(nearRpcMethod)).toBeTruthy()
    )
  })
})
