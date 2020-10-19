import React from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import Text from '../../components/Text';
import { Actions } from 'react-native-router-flux';
import { LOGIN_REQUEST } from '../../constants/route';
import { BLACK_COLOR_OPACITY, LIGHTGREY_COLOR, WHITE_COLOR } from '../../constants/color';
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text';

const onPress = (props) => Actions[LOGIN_REQUEST](props);

export default ({ data }) => {
    return (
        <TouchableOpacity style={style.card} onPress={() => onPress({ verified: false })}>
            <View style={style.details}>
                {data.img}
                <View style={style.description}>
                    <Text style={style.title}>
                        {data.title}
                    </Text>
                    <Text style={style.text}>
                        {data.expired}
                    </Text>
                </View>
                <View>
                    <Text style={[style.text, style.time]}>{data.time}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const style = StyleSheet.create({
    card: {
        backgroundColor: WHITE_COLOR,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: LIGHTGREY_COLOR,
        padding: 16,
        width: Dimensions.get('window').width - 40,
    },
    details: {
        flexDirection: 'row',
    },
    description: {
        flexShrink: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 12
    },
    title: {
        fontFamily: NUNITO_SANS_BOLD,
        fontSize: 17
    },
    text: {
        fontSize: 13,
        flexWrap: 'wrap',
        fontFamily: NUNITO_SANS_SEMIBOLD
    },
    time: {
        textAlign: 'right',
        color: BLACK_COLOR_OPACITY(0.6)
    }
});
