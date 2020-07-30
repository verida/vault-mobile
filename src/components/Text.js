import React from 'react'
import {StyleSheet, Text} from "react-native";

export default ({ style, children, ...props }) => (
    <Text style={[styles.text, style]} {...props}>
        {children}
    </Text>
)

const styles = StyleSheet.create({
    text: {
        color: '#041133',
        fontFamily: "Avenir",
        textAlignVertical: "center",
        paddingTop: 4
    }
});
