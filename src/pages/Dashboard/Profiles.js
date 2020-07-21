import React from "react";
import {View} from "react-native";

import PropertyList from "../../components/PropertyList";

import EarthSvg from "../../assets/icons/earth.svg";
import LockSvg from "../../assets/icons/lock.svg";

import LayoutStyle from "../../styles/layouts";

import {Actions} from "react-native-router-flux";
import {
    PRIVATE_PROFILE,
    PUBLIC_PROFILE
} from "../../constants/route";

export default () => (
    <View style={LayoutStyle.layout}>
        <View>
            <PropertyList list={list} />
        </View>
    </View>
)

const list = [
    { label: "Public Profile", icon: <EarthSvg />, action: "arrow", onPress: () => Actions[PUBLIC_PROFILE]() },
    { label: "Private Identity", icon: <LockSvg />, action: "arrow", onPress: () => Actions[PRIVATE_PROFILE]() }
];
