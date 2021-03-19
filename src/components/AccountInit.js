import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { TextInput, StyleSheet } from 'react-native';

import DropDownPicker from './Select';
import Button from './Button';
import Layout from './Layouts/Layout';
import Label from './Label';

import InputStyles from '../styles/inputs';
import { COUNTRIES } from '../helpers/country-list';

import { setPublicProfileData } from '../store/general/actions';
import { generateWallet } from '../api';

const AccountInit = ({ action, ...props }) => {
    const [name, setName] = useState('');
    const [country, setCountry] = useState(null);
    const [processing, setProcessing] = useState(false);

    const onCountryChange = (e) => setCountry(e);
    const onContinue = async (e) => {
        setProcessing(true)
        const wallet = await generateWallet({name, country: country.value});

        props.setPublicProfileData({ name, country: country.value });
        return Actions[action]();
    };

    return (
        <Layout title="Select Username" style={style.layout}>
            <Label>Name</Label>
            <TextInput
                placeholder={'Enter your name'}
                style={InputStyles.input}
                value={name}
                onChangeText={(t) => setName(t)} />

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
                disabled={!country || processing}
                onPress={onContinue}>
                Continue
            </Button>
        </Layout>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        setPublicProfileData: data => dispatch(setPublicProfileData(data)),
    };
};

export default connect(null, mapDispatchToProps)(AccountInit);

const style = StyleSheet.create ({
    layout: {
        minHeight: '70%'
    },
    mt: {
        marginTop: 40
    }
});
