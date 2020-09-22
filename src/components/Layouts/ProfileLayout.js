import React from 'react';
import { View, StyleSheet } from 'react-native';

import PropertyList from '../../components/PropertyList';
import Text from '../../components/Text';
import ImageLoader from '../../components/ImageLoader';
import Layout from './Layout';

import LayoutStyle from '../../styles/layouts';

import { BLACK_COLOR_OPACITY } from '../../constants/color';
import { NUNITO_SANS_SEMIBOLD } from '../../constants/text';

export default (props) => {
    return (
        <Layout style={LayoutStyle.layout}>
            <ImageLoader />
            { props.userInfo }
            <View>
                <PropertyList list={props.list} />
            </View>
            <Text style={style.description}>
                { props.description }
            </Text>
        </Layout>
    );
};

const style = StyleSheet.create({
    description: {
        textAlign: 'center',
        marginVertical: 17,
        color: BLACK_COLOR_OPACITY(0.4),
        fontSize: 12,
        fontFamily: NUNITO_SANS_SEMIBOLD
    }
});
