import React from 'react'

import TokensListItem from './TokensListItem'

export default ({ list }) =>
  list.map((item, index) => {
    return <TokensListItem key={`data-list-${index}`} item={item} />
  })
