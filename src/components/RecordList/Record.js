import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../Text';
import Filters from './Filters';

import { BLACK_COLOR_OPACITY, LIGHTGREY_COLOR } from '../../constants/color';
import { NUNITO_SANS_SEMIBOLD } from '../../constants/text';

export default ({ item }) => (
    <View style={style.card}>
        <View style={style.header}>
            <Text style={style.title}>{ item.title }</Text>
            <Text style={style.amount}>{ item.amount } records</Text>
        </View>
        <Text style={style.text}>Inserted {'>'} { item.insertedAt }</Text>
        { item.filters && <Filters filters={item.filters} key={`filter-${item.id}`} /> }
    </View>
);

const style = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 4,
        borderColor: LIGHTGREY_COLOR,
        padding: 16,
        marginBottom: 8
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    title: {
        fontSize: 17,
        lineHeight: 22,
        fontFamily: NUNITO_SANS_SEMIBOLD
    },
    amount: {
        fontSize: 13,
        lineHeight: 22,
        fontFamily: NUNITO_SANS_SEMIBOLD
    },
    text: {
        color: BLACK_COLOR_OPACITY(0.5),
        fontSize: 15,
        lineHeight: 22,
        fontFamily: NUNITO_SANS_SEMIBOLD
    }
});
