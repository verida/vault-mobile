import React from 'react';

import DataFieldItem from './DataFieldItem';

export default ({ data }) => data.data.map((item, index) => {
    return <DataFieldItem key={`data-field-${index}`} item={item} data={data} />;
});
