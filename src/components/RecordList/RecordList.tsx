import React from 'react'

import Record from './Record'

interface RecordListProps {
  list: any[]
}

const RecordList: React.FC<RecordListProps> = ({ list }) => {
  return (
    <>
      {list.map((item) => (
        <Record item={item} key={`record - ${item.id}`} />
      ))}
    </>
  )
}

export default RecordList
