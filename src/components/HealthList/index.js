import React from 'react';

import HealthListItem from './HealthListItem';

export default ({ list }) => list.map((item, index) => {
    return <HealthListItem key={`health-list-${index}`} item={item} />;
});
