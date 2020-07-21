import React from "react";
import { View, Dimensions, StyleSheet, TouchableOpacity } from "react-native";

import Animated from "react-native-reanimated";

export default ({ navigationState, onIndexChange }) => {
    const {routes, index} = navigationState;
    return (
        <View style={style.tabBar}>
            { routes.map((route, i) => (
                    <TouchableOpacity
                        key={`index-${i}`}
                        style={[style.tabItem, i === index && style.tabItemActive]}
                        onPress={() => onIndexChange(i)}>
                        <Animated.Text style={style.tabItemText}>{route.title}</Animated.Text>
                    </TouchableOpacity>
                )
            )}
        </View>
    );
}

const style = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        width: Dimensions.get('window').width - 54,
        backgroundColor: "rgba(118, 118, 128, 0.12)",
        borderRadius: 8,
        marginVertical: 8,
        marginHorizontal: 27,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        borderRadius: 8,
        padding: 3,
        margin: 2
    },
    tabItemText: {
        color: "#041133",
        fontWeight: "500"
    },
    tabItemActive: {
        backgroundColor: "white",
    }
});
