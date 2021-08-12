import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import Success from '../assets/success.svg';

import Text from '../components/Text';
import Details from '../components/Details';
import Button from '../components/Button';
import Layout from '../components/Layouts/Layout';
import { BLACK_COLOR } from '../constants/color';
import { NUNITO_SANS_BOLD } from '../constants/text';

import { setAuthStatus, setBioAuthStatus } from '../store/general/actions';

const SuccessPage = (props) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const hasSavedBio = await LocalAuthentication.isEnrolledAsync();
    props.setBioAuthStatus(hasSavedBio);
    setLoading(false);
  };

  const onDone = () => {
    props.setAuthStatus(true);
  };

  if (loading) {
    return (
      <View style={style.loadingContent}>
        <Text>Loading </Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Layout style={style.layout}>
      <View style={style.header}>
        <Success/>
        <Text style={style.title}>Success!</Text>
      </View>
      <Text style={style.description}>
                A new wallet has been created and installed on your device.
      </Text>
      <Details/>
      <Button style={style.mt} color="primary" onPress={onDone}>
                Done
      </Button>
    </Layout>
  );
};

const mapDispatchToProps = dispatch => {
  return {
    setBioAuthStatus: status => dispatch(setBioAuthStatus(status)),
    setAuthStatus: status => dispatch(setAuthStatus(status))
  };
};

export default connect(null, mapDispatchToProps)(SuccessPage);

const style = StyleSheet.create ({
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent:'center'
  },
  layout: {
    justifyContent: 'center',
    minHeight: '100%'
  },
  header: {
    alignItems: 'center'
  },
  title: {
    margin: 32,
    fontSize: 28,
    color: BLACK_COLOR,
    fontFamily: NUNITO_SANS_BOLD
  },
  description: {
    fontFamily: 'NunitoSans',
    fontWeight: '500',
    fontSize: 14,
    color: BLACK_COLOR,
    opacity: 0.6
  },
  mt: {
    marginTop: 56
  }
});
