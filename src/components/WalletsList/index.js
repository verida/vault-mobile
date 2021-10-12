import React from 'react'

import WalletsListItem from './WalletsListItem'

export default ({ list }) =>
  list.map((item, index) => {
    return <WalletsListItem key={`wallets-list-${index}`} item={item} />
  })
