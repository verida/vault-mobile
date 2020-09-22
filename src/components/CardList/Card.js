import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Text from '../Text';

import { findTypeById } from '../../helpers/inbox';
import {
    BLACK_COLOR_OPACITY,
    LIGHTGREY_COLOR,
    ORANGE_COLOR
} from '../../constants/color';

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text';

export default ({ options }) => {
    const type = findTypeById(options.id);
    const title = options.title + (options.from ? ' from ' : '');

    const onPress = () => Actions[type.action]({ id: options.id });

    return (
        <TouchableOpacity style={style.card} onPress={onPress}>
            <Image source={{ uri: options.logo }} style={style.logo} />
            <View style={style.details}>
                <View style={style.tile}>
                    <View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={style.title}>{title} </Text>
                            { !options.read && <View style={style.new} /> }
                        </View>
                        { Boolean(options.from) && <Text style={style.title}>{options.from} </Text> }
                    </View>
                    <Text style={style.date}>
                        {options.createdAt}
                    </Text>
                </View>
                <View style={style.tile}>
                    <Text style={{ ...style.text, marginTop: 4 }}>{type.title}</Text>
                    { type.svg && type.svg() }
                </View>
            </View>
        </TouchableOpacity>
    );
};

const style = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: LIGHTGREY_COLOR,
        borderRadius: 4,
        marginBottom: 8,
        paddingVertical: 20,
        paddingHorizontal: 16,
        flexDirection: 'row'
    },
    logo: {
        width: 40,
        height: 40,
        borderColor: LIGHTGREY_COLOR,
        borderRadius: 20
    },
    title: {
        fontSize: 17,
        lineHeight: 28,
        alignItems: 'center',
        fontFamily: NUNITO_SANS_BOLD
    },
    text: {
        fontFamily: NUNITO_SANS_SEMIBOLD,
        fontSize: 13,
        lineHeight: 18
    },
    tile: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    details: {
        paddingLeft: 15,
        flexDirection: 'column',
        flex: 1
    },
    new: {
        width: 8,
        height: 8,
        backgroundColor: ORANGE_COLOR,
        borderRadius: 4,
        marginTop: 4
    },
    date: {
        color: BLACK_COLOR_OPACITY(0.6),
        fontFamily: NUNITO_SANS_SEMIBOLD,
        fontSize: 13,
        marginTop: 3
    }
});
