import React from "react";
import Text from "../Text";
import {StyleSheet, TouchableOpacity} from "react-native";
import {LIGHTGREY_COLOR} from "../../constants/color";

const onSelect = (word) => {
  console.log(word, "word");
};

export default ({ words }) => words.map(word => (
    <TouchableOpacity key={word} style={style.word} onPress={() => onSelect(word)}>
        <Text style={{ fontWeight: '800' }}>{ word }</Text>
    </TouchableOpacity>
));

const style = StyleSheet.create ({
    word: {
        borderWidth: 1,
        borderColor: LIGHTGREY_COLOR,
        borderRadius: 4,
        paddingVertical: 3,
        paddingHorizontal: 15,
        marginRight: 10,
        marginBottom: 10
    }
});
