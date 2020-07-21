import React, { useState } from 'react'
import { TextInput, Text, StyleSheet } from "react-native";
import { getNames } from "country-list"
import DropDownPicker from "../components/Select";

import Button from "../components/Button";
import Layout from "../components/Layouts/Layout";
import { Actions } from "react-native-router-flux";
import {SEED_PHRASE} from "../constants/route";
import {BLACK_COLOR_OPACITY, LIGHTGREY_COLOR} from "../constants/color";

export default () => {
    const [username, setUsername] = useState(null);
    const [country, setCountry] = useState(null);
    const countries = getNames()
        .sort((a, b) => a > b)
        .map(item => ({ label: item, value: item}));

    const onCountryChange = (e) => setCountry(e);
    const onContinue = () => Actions[SEED_PHRASE]();

    return (
        <Layout title="Select Username">
            <Text style={style.label}>Username</Text>
            <TextInput
                placeholder={"Enter username"}
                style={style.input}
                value={username}
                onChangeText={setUsername} />

            <Text style={style.label}>Country</Text>
            <DropDownPicker
                searchable={true}
                searchablePlaceholder="Search..."
                placeholder=""
                items={countries}
                containerStyle={style.select}
                onChangeItem={onCountryChange}
            />
            <Button style={style.mt}
                color="primary"
                disabled={!country}
                onPress={onContinue}>
                Continue
            </Button>
        </Layout>
    )
};

const style = StyleSheet.create ({
    label: {
        marginTop: 16,
        marginBottom: 4,
        fontWeight: '500',
        fontSize: 12,
        color: BLACK_COLOR_OPACITY(0.8)
    },
    input: {
        borderWidth: 1,
        borderColor: LIGHTGREY_COLOR,
        borderRadius: 4,
        paddingVertical: 15,
        paddingHorizontal: 16
    },
    select: {
        height: 50,
        alignItems: "flex-start"
    },
    activeItemStyle: {
        alignItems: "flex-start",
        justifyContent: "center"
    },
    dropDownStyle: {
        alignItems: "flex-start"
    },
    activeLabelStyle: {
        alignItems: "flex-start"
    },
    mt: {
        marginTop: 40
    }
});
