import React from "react";
import Text from "../../components/Text";
import Button from "../../components/Button";
import Layout from "../../components/Layouts/Layout";
import List from "../../components/Lists/List";

import TextStyles from "../../styles/text";
import SafeImg from "../../assets/safe.svg";

import { Actions } from "react-native-router-flux";
import {SEED_PHRASE_GENERATED} from "../../constants/route";

const Items = [
  "The seed phrase is composed of 12 words. Please record them carefully and store your phrase in a safe place.",
  "For security reason there is no password reset."
];

const onShow = () => Actions[SEED_PHRASE_GENERATED]();

export default () => (
    <Layout title="Seed Phrase">
        <Text style={[TextStyles.primary, {marginVertical: 16}]}>
            Seed phrase is the only way to recover access to your account if your phone is lost, stolen broken or
            upgraded.
        </Text>
        <SafeImg style={{marginVertical: 28, alignSelf: 'center'}}/>
        <List items={Items}/>
        <Button style={{marginTop: 56}} color="primary" onPress={onShow}>
            Show Seed Phrase
        </Button>
    </Layout>
);
