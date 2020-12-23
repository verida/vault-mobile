import React from 'react';

import DataCardItem from './DataCardItem';

export default ({ list }) => list.map((item, index) => {
    return <DataCardItem key={`data-card-${index}`} item={item} />;
});
