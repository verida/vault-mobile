import React from "react";
import Card from "./Card";
import { View } from "react-native";

export default ({ list }) => {
    const cards = list.map(options => (<Card options={options} key={`inbox - ${options.id}`} />))

    return (
        <View>
            { cards }
        </View>
    )
}
