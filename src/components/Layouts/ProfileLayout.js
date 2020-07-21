import React from "react";
import {View, StyleSheet} from "react-native";

import PropertyList from "../../components/PropertyList";
import Text from "../../components/Text";
import ImageLoader from "../../components/ImageLoader";

import LayoutStyle from "../../styles/layouts";
import {BLACK_COLOR} from "../../constants/color";

export default (props) => {
    return (
        <View style={LayoutStyle.layout}>
            <ImageLoader />
            { props.userInfo }
            <View>
                <PropertyList list={props.list} />
            </View>
            <Text style={style.description}>
                { props.description }
            </Text>
        </View>
    )
}

const style = StyleSheet.create({
    description: {
        textAlign: "center",
        marginVertical: 17,
        color: BLACK_COLOR,
        opacity: 0.4,
        fontSize: 12
    }
});
