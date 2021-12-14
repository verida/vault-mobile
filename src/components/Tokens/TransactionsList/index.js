import React from 'react'

import TransactionsListItem from './TransactionsListItem'

export default ({ symbol, list }) =>
  list.map((item, index) => {
    return (
      <TransactionsListItem
        key={`data-list-${index}`}
        symbol={symbol}
        item={item}
      />
    )
  })
