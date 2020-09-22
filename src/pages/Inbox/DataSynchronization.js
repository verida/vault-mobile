import React from 'react';

import RequestDetailsLayout from '../../components/Inbox/RequestDetailsLayout';
import RecordList from '../../components/RecordList';

const company = {
    uri: 'http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png',
    name: 'Steve Smith from Verida Health: ERM',
    createdAt: 'May 25',
    type: 3
};

const records = [
    {
        id: 2,
        title: 'Health / Activities',
        amount: 32,
        insertedAt: '2019.07.03',
        filters: [
            'Source = Mt barker medical practice'
        ]
    },
    {
        id: 3,
        title: 'Health / Activities',
        amount: 512,
        insertedAt: '2019.07.03'
    }
];

export default ({ id }) => {
    return (
        <RequestDetailsLayout company={company}>
            <RecordList list={records} />
        </RequestDetailsLayout>
    );
};
