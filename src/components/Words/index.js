import React, { useState } from "react";
import Words from "./Words";
import {View, StyleSheet, Text} from "react-native";
import TextStyles from "../../styles/text";

import _ from "underscore";
import {LIGHTGREY_COLOR} from "../../constants/color";

/*mnemonic: {
    origin: mnemonic,
    shuffled: _.shuffle(mnemonic)
}*/

export default ({ words }) => {
    const mnemonic = words.split(" ");
    const shuffled = _.shuffle(mnemonic);
    const [template, setTemplate] = useState([]);

    return (
        <>
            <View style={[style.container, {marginTop: 32}]}>
                <Words words={template} />
            </View>
            <Text style={[TextStyles.darkgrey, style.text]}>
                Please tap each word in the correct order.
            </Text>
            <View style={[style.vocabulary]}>
                <Words words={shuffled} />
            </View>
        </>
    )
}

const style = StyleSheet.create ({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: LIGHTGREY_COLOR,
        borderRadius: 4,
        padding: 16,
        flexDirection:'row',
        flexWrap:'wrap'
    },
    vocabulary: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row',
        flexWrap:'wrap'
    },
    text: {
        marginVertical: 24,
        textAlign: 'center'
    }
});
