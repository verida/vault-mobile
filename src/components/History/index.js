import React from 'react';
import { View, StyleSheet } from 'react-native';

import History from './History';
import EmptyList from '../Lists/EmptyList';

import VaultLogo from '../../assets/vault-logo.png';

const list = [
    {
        id: 'test-1',
        img: VaultLogo,
        title: 'Login request from Verida Vault',
        time: '5sec ago',
        expired: 'Expired in 3m'
    }
];

export default ({ route }) => {
    const requests = (route.key !== 'denied' && list) || [];

    const history = requests.length &&
        (<View style={style.container}>
            { requests.map((item) => <History key={item.id} data={item}/>) }
        </View>);


    return (history || <EmptyList type={route.key} />);
};

const style = StyleSheet.create({
    container: {
        marginTop: 24,
        marginHorizontal: 20
    }
});
