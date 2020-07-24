import React, { useState } from 'react'
import { TextInput, StyleSheet } from "react-native";
import DropDownPicker from "../components/Select";

import Button from "../components/Button";
import Layout from "../components/Layouts/Layout";
import { Actions } from "react-native-router-flux";
import {SEED_PHRASE} from "../constants/route";
import Label from "../components/Label";

import InputStyles from "../styles/inputs";
import {COUNTRIES} from "../helpers/country-list";

export default () => {
    const [username, setUsername] = useState(null);
    const [country, setCountry] = useState(null);

    const onCountryChange = (e) => setCountry(e);
    const onContinue = () => Actions[SEED_PHRASE]();

    return (
        <Layout title="Select Username">
            <Label>Username</Label>
            <TextInput
                placeholder={"Enter username"}
                style={InputStyles.input}
                value={username}
                onChangeText={setUsername} />

            <Label>Country</Label>
            <DropDownPicker
                searchable={true}
                searchablePlaceholder="Search..."
                placeholder=""
                items={COUNTRIES}
                containerStyle={InputStyles.select}
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
    mt: {
        marginTop: 40
    }
});
