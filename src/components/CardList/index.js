import React from "react";
import Card from "./Card";
import {View, StyleSheet} from "react-native";

export default ({ list }) => {
    const cards = list.map(options => (<Card options={options} />))

    return (
        <View style={style.mt}>
            { cards }
        </View>
    )
}


const style = StyleSheet.create({
    mt: {
        marginTop: 24
    }
});
