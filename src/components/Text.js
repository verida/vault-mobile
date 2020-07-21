import React from 'react'
import {StyleSheet, Text} from "react-native";

export default (props) => (
    <Text style={[style.text, props.style]}>
        {props.children}
    </Text>
)

const style = StyleSheet.create({
    text: {
        color: '#041133',
        fontFamily: 'Avenir'
    }
});
