import React, { useState } from 'react';
import { Actions } from 'react-native-router-flux';
import { TextInput, StyleSheet } from 'react-native';

import DropDownPicker from './Select';
import Button from './Button';
import Layout from './Layouts/Layout';
import Label from './Label';

import InputStyles from '../styles/inputs';
import { COUNTRIES } from '../helpers/country-list';

export default ({ action }) => {
    const [username, setUsername] = useState(null);
    const [country, setCountry] = useState(null);

    const onCountryChange = (e) => setCountry(e);
    const onContinue = () => Actions[action]();

    return (
        <Layout title="Select Username" style={style.layout}>
            <Label>Username</Label>
            <TextInput
                placeholder={'Enter username'}
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
    );
};

const style = StyleSheet.create ({
    layout: {
        minHeight: '70%'
    },
    mt: {
        marginTop: 40
    }
});
