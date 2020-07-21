import React from "react";
import {StyleSheet, View} from "react-native";
import Text from "../Text";
import {BLACK_COLOR} from "../../constants/color";

export default (props) => {
    return (
        <View style={[style.container, props.style]}>
            { props.title && <Text style={style.title}>{ props.title }</Text> }
            { props.children }
        </View>
    )
};

const style = StyleSheet.create ({
    container: {
        paddingHorizontal: 20
    },
    title: {
        marginTop: 16,
        fontWeight: '800',
        fontSize: 22,
        lineHeight: 41,
        color: BLACK_COLOR
    }
});
