import React from 'react';
import ProfileLayout from '../../components/Layouts/ProfileLayout';

import { editable } from '../../helpers/profile';

const list = [
    { label: 'Name', value: 'Chris Were', action: 'arrow', type: 'input' },
    { label: 'Country', value: 'Australia', action: 'arrow', type: 'select' },
    { label: 'Description', value: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.", action: 'arrow', type: 'textarea' }
];

export default () => (
    <ProfileLayout
        list={editable(list)}
        description={'This profile is public and can be discovered by others'} />
);
