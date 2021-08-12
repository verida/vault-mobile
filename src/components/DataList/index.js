import React from 'react';

import DataListItem from './DataListItem';

export default ({ list }) => list.map((item, index) => {
    console.log('item:', item);
    return <DataListItem key={`data-list-${index}`} item={item} />;
});
