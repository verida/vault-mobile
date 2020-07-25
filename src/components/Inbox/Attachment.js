import React from "react";
import Text from "../Text";

import FileSvg from "../../assets/inbox/file.svg";
import {StyleSheet, View} from "react-native";

export default ({ options }) => {
   return (
       <View style={style.container}>
           <FileSvg />
           <View style={style.description}>
               <Text style={style.title}>{options.title}</Text>
               <Text style={style.text}>{options.size}</Text>
           </View>
       </View>
   );
}

const style = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        flex: 0.5
    },
    description: {
        paddingLeft: 12
    },
    title: {
        fontFamily: "AvenirBold",
        fontSize: 15
    },
    text: {
        fontSize: 13
    }
});
