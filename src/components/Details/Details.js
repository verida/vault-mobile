import Text from "../Text";
import React from "react";
import {StyleSheet, View} from "react-native";


export default (props) => (
    <View style={style.container}>
        <Text style={style.title}>{props.title}</Text>
        <Text style={style.text}>{props.text}</Text>
    </View>
)

const style = StyleSheet.create ({
    container: {
        marginTop: 32
    },
    title: {
        fontWeight: '800',
        fontSize: 20
    },
    text: {
        marginTop: 2,
        fontWeight: '500',
        fontSize: 18,
        opacity: 0.8
    }
});
