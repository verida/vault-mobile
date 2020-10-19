import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import ProfileLayout from '../../components/Layouts/ProfileLayout';
import Text from '../../components/Text';

import { getWallet } from '../../api';
import { editable } from '../../helpers/profile';
import DateOfBirth from '../../components/DateOfBirth';
import { NUNITO_SANS_BOLD } from '../../constants/text';
import { BLACK_COLOR_OPACITY } from '../../constants/color';

const list = [
    { label: 'Name', value: 'Chris Were', action: 'arrow', type: 'input' },
    { label: 'Email', value: 'chris.were@gmail.com', action: 'arrow', type: 'input' },
    { label: 'Phone', value: '+61 (214) 428-346', action: 'arrow', type: 'phone' },
    { label: 'Date of Birth', action: 'arrow',
        onPress: () => {},
        optional: true,
        custom: <DateOfBirth selected={null} /> },
    { label: 'Address', value: null, action: 'arrow', type: 'input' }
];

export default () => {
    const [info, setInfo] = useState({});
    useEffect(() => {
        init();
    });

    const init = async () => {
        const data = await getWallet();
        setInfo(data);
    };

    const UserInfo =
        <View>
            <Text style={style.user}>{ info.username || '[Name Surname]' }</Text>
            <Text style={style.did}>{ info.address }</Text>
        </View>;

    return (
        info && <ProfileLayout
            userInfo={UserInfo}
            list={editable(list)}
            description={'This profile is private, but can be requested and shared with your consent'} />
    );
};

const style = StyleSheet.create({
    user: {
        fontFamily: NUNITO_SANS_BOLD,
        fontSize: 22,
        textAlign: 'center'
    },
    did: {
        marginTop: 4,
        fontFamily: NUNITO_SANS_BOLD,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 25,
        color: BLACK_COLOR_OPACITY(0.6)
    }
});
