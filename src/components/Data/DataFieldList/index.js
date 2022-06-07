import React from 'react'

import DataFieldItem from './DataFieldItem'

export default ({ data, setCopyUrl }) =>
  data.data.map((item, index) => {
    if(item.field === 'DID')
      setCopyUrl(item.value)
    return <DataFieldItem key={`data-field-${index}`} item={item} data={data} setCopyUrl={setCopyUrl} />
  })
