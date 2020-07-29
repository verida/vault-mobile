import React, { useState, useEffect } from "react";
import {StyleSheet} from "react-native";

import Text from "../../components/Text";
import Button from "../../components/Button";
import Layout from "../../components/Layouts/Layout";
import WordCard from "../../components/Words/WordCard";

import TextStyles from "../../styles/text";
import {Actions} from "react-native-router-flux";

import {generateMnemonic} from "../../api";
import {VERIFY_PHRASE} from "../../constants/route";
import _ from "underscore";

export default () => {
    const [words, setWords] = useState("Generating seed phrase ...");

    useEffect(() => {
        const mnemonic = generateMnemonic();
        setWords(mnemonic);
    }, []);

    const onSaved = async () => {
        const mnemonic = words.split(" ");
        const shuffled = _.shuffle(mnemonic);
        Actions[VERIFY_PHRASE]({ shuffled });
    };

    return (
        <Layout title="Seed Phrase">
            <Text style={[TextStyles.grey, style.title]}>
                Please carefully write down each word
            </Text>
            <WordCard words={words} />
            <Button style={{marginTop: 40}} color="primary" onPress={onSaved}>
                I have saved my seed words
            </Button>
        </Layout>
    );
};

const style = StyleSheet.create ({
    title: {
        marginTop: 32,
        marginBottom: 16,
        textAlign: 'center'
    }
});
