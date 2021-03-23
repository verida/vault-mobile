import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import ProfileLayout from '../../components/Layouts/ProfileLayout';
import NavigationHeader from '../../components/Navigation/NavigationHeader';

import { setPublicProfileData } from '../../store/general/actions';
import { editable } from '../../helpers/profile';
import { getVault } from '../../api';

const PublicProfile = (props) => {
    const [list, setList] = useState([
        { label: 'Name', value: '', action: 'arrow', type: 'input' },
        { label: 'Country', value: '', action: 'arrow', type: 'select' },
        { label: 'Description', value: '', action: 'arrow', type: 'textarea' }
    ]);

    const updateData = async () => {
        let profileProperties = props.publicProfileData;
        const vault = await getVault();
        const publicData = await vault.profiles.public.getMany();
        profileProperties = publicData.reduce((acc, field) => {
            acc = { ...acc, [field.key]: field.value };
            return acc;
        }, {});

        props.setPublicProfileData(profileProperties);
        const updatedList = list.map((item) => {
            const label = item.label.toLowerCase();
            if (profileProperties[label]) item.value = profileProperties[label];
            return item;
        });

        setList(updatedList);
    }

    const bindChanges = async () => {
        const vault = await getVault();
        await vault.profiles.public.init();
        const db = await vault.profiles.public.store.getDb();
        const dbInstance = await db.getInstance();
        dbInstance.changes({
            since: 'now',
            live: true
        }).on('change', async function(info) {
            updateData()
        });
    }

    // component did mount
    useEffect(() => {
        updateData();
        bindChanges();
    }, [])

    // component redrawn
    useEffect(() => {
    }, [props.publicProfileData]);

    return (
        <View>
            <NavigationHeader title="Public Profile" />
            <ProfileLayout
                list={editable(list)}
                description={'This profile is public and can be discovered by others'} />
        </View>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        setPublicProfileData: data => dispatch(setPublicProfileData(data)),
    };
};

const mapStateToProps = state => {
    return { publicProfileData: state.publicProfileData };
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicProfile);
