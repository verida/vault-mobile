import React from 'react';
import { Container, Content } from 'native-base';

import RequestDetailsLayout from '../../components/Inbox/RequestDetailsLayout';
import RecordList from '../../components/RecordList';
import NavigationHeader from 'components/Navigation/NavigationHeader';

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
        <Container>
            <NavigationHeader title="Request details" />
            <Content>
                <RequestDetailsLayout company={company}>
                    <RecordList list={records} />
                </RequestDetailsLayout>
            </Content>
        </Container>
    );
};
