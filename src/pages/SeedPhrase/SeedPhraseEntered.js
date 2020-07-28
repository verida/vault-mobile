import React, { useState, useEffect } from "react";
import {Actions} from "react-native-router-flux";
import {TextInput, StyleSheet} from "react-native";

import Layout from "../../components/Layouts/Layout";
import Button from "../../components/Button";
import Label from "../../components/Label";

import InputStyles from "../../styles/inputs";
import {ORANGE_COLOR} from "../../constants/color";

import _ from "underscore";
import {walletByMnemonic, MNEMONIC_LENGTH} from "../../api";
import {SUCCESS} from "../../constants/route";

export default () => {
    const [phrase, setPhrase] = useState("");
    const [verified, setVerified] = useState(false);
    const [error, showError] = useState(null);

    useEffect(() => { verify() }, [phrase]);

    const verify = async () => {
        showError(false);

        const splitted = phrase && phrase.split(" ");
        if (!splitted) {
            setVerified(false);
            return;
        }

        const correct = splitted.length === MNEMONIC_LENGTH && _.last(splitted).length;
        setVerified(correct);
    };

    const onContinue = async () => {
        try {
            await walletByMnemonic(phrase);
            Actions[SUCCESS]();
        } catch (e) {
            showError(true);
        }
    };

    return (
        <Layout title="Seed Phrase">
            <Label style={[style.label, error && style.errorText]}>
                Enter your Ethereum seed phrase below
            </Label>
            <TextInput
                value={phrase}
                autoFocus={true}
                multiline
                editable
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={setPhrase}
                style={[InputStyles.textarea, error && style.error]}
            />
            { error &&
                <Label style={[style.label, style.errorText]}>
                    Error: Please, enter a valid seed phrase
                </Label> }
            <Button style={{marginTop: 24}}
                    color="primary"
                    onPress={onContinue}
                    disabled={!verified}>
                Continue
            </Button>
        </Layout>
    );
}

const style = StyleSheet.create({
    label: {
        marginTop: 5,
        marginBottom: 7
    },
    error: {
        borderColor: ORANGE_COLOR
    },
    errorText: {
        color: ORANGE_COLOR
    }
});
