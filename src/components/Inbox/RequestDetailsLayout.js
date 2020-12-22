import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Layout from '../../components/Layouts/Layout';
import Button from '../../components/Button';
import Text from '../Text';
import Description from './Description';

import { NUNITO_SANS_BOLD } from '../../constants/text';

export default ({ type, item, children }) => {
    const description = {
        uri: 'http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png',
        name: item.item.message,
        createdAt: item.createdAt
    };

    console.log(item)

    return (
        <Layout style={style.layout}>
            <View style={style.header}>
                <Text style={style.title}>{ type.title }</Text>
                { type.svg && type.svg(40,40, style.svg) }
            </View>
            <Description details={description} />
            <ScrollView>
                { children }
            </ScrollView>
            <View style={style.action}>
                <Button style={{ ...style.btn, marginRight: 20 }}>Accept</Button>
                <Button color="grey" style={style.btn}>Decline</Button>
            </View>
        </Layout>
    );
};

const style = StyleSheet.create({
    layout: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontSize: 22,
        lineHeight: 41,
        fontFamily: NUNITO_SANS_BOLD,
        marginTop: 24,
        paddingRight: 60
    },
    action: {
        flexDirection: 'row',
        marginVertical: 30,
        bottom: 0,
    },
    btn: {
        flex: 0.5,
        height: 40
    },
    svg: {
        position: 'absolute',
        right: 0,
        top: 25
    }
});
