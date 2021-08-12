import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native';
import { Container, Content } from 'native-base';

import Layout from '../../components/Layouts/Layout';
import Button from '../../components/Button';
import Label from '../../components/Label';
import NavigationHeader from 'components/Navigation/NavigationHeader';

import { walletByMnemonic, MNEMONIC_LENGTH } from '../../api';
import { SUCCESS } from '../../constants/route';
import ErrorPhrase from '../../components/ErrorPhrase';

import ModifierStyles from '../../styles/modifier';
import InputStyles from '../../styles/inputs';

import _ from 'underscore';

export default (props) => {
    const [phrase, setPhrase] = useState('');
    const [verified, setVerified] = useState(false);
    const [error, showError] = useState(null);

    useEffect(() => { verify(); }, [phrase]);

    const verify = async () => {
        showError(false);

        const splitted = phrase && phrase.split(' ');
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
            props.navigation.navigate('Success')
        } catch (e) {
            showError(true);
        }
    };

    return (
        <Container>
            <NavigationHeader title="Import An Account" />
            <Content>
                <Layout title="Seed Phrase">
                    <Label style={[ModifierStyles.label, error && ModifierStyles.errorText]}>
                        Enter your seed phrase below
                    </Label>
                    <TextInput
                        value={phrase}
                        autoFocus={true}
                        multiline
                        editable
                        autoCorrect={false}
                        autoCapitalize="none"
                        onChangeText={setPhrase}
                        style={[InputStyles.textarea, error && ModifierStyles.error]}
                    />
                    <ErrorPhrase shown={error} />
                    <Button style={{ marginTop: 24 }}
                        color="primary"
                        onPress={onContinue}
                        disabled={!verified}>
                        Continue
                    </Button>
                </Layout>
            </Content>
        </Container>
    );
};
