import React from "react";
import {StyleSheet, Text} from "react-native";
import {BLACK_COLOR_OPACITY} from "../constants/color";

export default (props) => {
    return (
        <Text style={style.label}> { props.children } </Text>
    )
}

const style = StyleSheet.create ({
    label: {
        marginTop: 16,
        marginBottom: 4,
        fontWeight: '500',
        fontSize: 12,
        color: BLACK_COLOR_OPACITY(0.8)
    }
});
