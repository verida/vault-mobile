import React from 'react'
import {StyleSheet, Text} from "react-native";

export default ({ style, children, ...props }) => (
    <Text style={[style.text, style]} {...props}>
        {children}
    </Text>
)

const style = StyleSheet.create({
    text: {
        color: '#041133',
        fontFamily: "Avenir"
    }
});
