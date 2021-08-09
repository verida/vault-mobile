import React, { useState } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TextInput, ViewProps } from 'react-native';

import DropDownPicker from './Select';
import Button from './Button';
import Layout from './Layouts/Layout';
import Label from './Label';

import InputStyles from '../styles/inputs';
import { COUNTRIES } from '../helpers/country-list';

import { setPublicProfileData } from '../store/general/actions';
import { generateWallet } from '../api';

export enum AccountInitMode {
  SELECT_NETWORK,
  SEED_PHRASE
}

type Props = Omit<ViewProps, 'children'> & {
  mode: AccountInitMode
}

const AccountInit = (props: Props ) => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCountryChange = (e) => setCountry(e);
  const onContinue = async (e) => {
    setProcessing(true);
    const wallet = await generateWallet({ name, country: country.value });

    props.setPublicProfileData({ name, country: country.value });
    if(props.mode === AccountInitMode.SEED_PHRASE) {
      props.navigation.navigate('SeedPhrase');
    } else {
      props.navigation.navigate('SelectNetwork');
    }
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
