import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../../components/Text';

import History from './History';
import EmptyList from '../Lists/EmptyList';
import { getVeridaApp } from '../../api'

export default ({ route }) => {
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        const veridaApp = await getVeridaApp()
        const datastore = await veridaApp.openDatastore('https://schemas.verida.io/auth/loginRequest/schema.json')
        const filter = {
            approved: route.key == 'approved'
        }

        const requests = await datastore.getMany(filter, {sort: [{ insertedAt: 'desc' }]})

        const history = requests.length &&
            (<View style={style.container}>
                { requests.map((item) => <History key={item._id} data={item}/>) }
            </View>);

        setHistory(history)
        setLoading(false)
    }


    return (
        loading ? <View style={style.container}><Text>Loading...</Text></View> :
        (history || <EmptyList type={route.key} />)
    );
};

const style = StyleSheet.create({
    container: {
        marginTop: 24,
        marginHorizontal: 20
    }
});
