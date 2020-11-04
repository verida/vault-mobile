import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import ProfileLayout from '../../components/Layouts/ProfileLayout';
import NavigationHeader from '../../components/Navigation/NavigationHeader';

import { editable } from '../../helpers/profile';
import { getVault } from '../../api';

export default () => {
    const [list, setList] = useState([
        { label: 'Name', value: '', action: 'arrow', type: 'input' },
        { label: 'Country', value: '', action: 'arrow', type: 'select' },
        { label: 'Description', value: '', action: 'arrow', type: 'textarea' }
    ]);

    useEffect(async () => {
        const vault = await getVault();

        const publicData = await vault.profiles.public.getMany();

        const profileProperties = publicData.reduce((acc, field) => {
            acc = { ...acc, [field.key]: field.value };
            return acc;
        }, {});

        const updatedList = list.map((item) => {
            const label = item.label.toLowerCase();
            if (profileProperties[label]) item.value = profileProperties[label];
            return item;
        });

        setList(updatedList);
    }, []);

    return (
        <View>
            <NavigationHeader title="Public Profile" />
            <ProfileLayout
                list={editable(list)}
                description={'This profile is public and can be discovered by others'} />
        </View>
    );
};
