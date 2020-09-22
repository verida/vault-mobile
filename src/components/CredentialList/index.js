import React from 'react';
import CredentialCard from './CredentialCard';

const credentials = [
    {
        id: 1,
        title: 'ACT Driver License',
        logo: 'https://cdn.dribbble.com/users/612987/screenshots/4313437/phoenix-logo.jpg',
        description: 'ACT',
        createdAt: 'May 6, 2020 11:00 am'
    },
    {
        id: 2,
        title: 'Employment',
        logo: 'https://cdn.dribbble.com/users/612987/screenshots/4313437/phoenix-logo.jpg',
        description: 'IBM HR',
        createdAt: 'May 5, 2020 7:37 pm'
    },
    {
        id: 3,
        title: 'COVID-19 PCR TEST',
        logo: 'https://cdn.dribbble.com/users/612987/screenshots/4313437/phoenix-logo.jpg',
        description: 'SA Pathology',
        createdAt: 'May 1, 2020 10:03 am'
    },
];

export default () => credentials.map(item =>
    <CredentialCard
        key={`credential-card-${item.id}`}
        item={item}
        active={true} />
);
