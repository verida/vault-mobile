import 'jest'

import * as React from 'react'

describe('jest', () => {
  it('test', expect(true).toBeTruthy)
  it('jsx', expect(<React.Fragment />).toBeTruthy)
})
