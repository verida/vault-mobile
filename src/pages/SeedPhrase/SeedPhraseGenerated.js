import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import Clipboard from '@react-native-community/clipboard';

import Text from '../../components/Text';
import Button from '../../components/Button';
import Layout from '../../components/Layouts/Layout';
import WordCard from '../../components/Words/WordCard';

import { generateMnemonic } from '../../api';
import { VERIFY_PHRASE } from '../../constants/route';
import { BLACK_COLOR_OPACITY } from '../../constants/color';

import { onRemind } from '../../helpers/account';

import _ from 'underscore';

const SeedPhraseGenerated = () => {
    const [words, setWords] = useState('Generating seed phrase ...');

    useEffect(async () => {
        const mnemonic = await generateMnemonic();
        setWords(mnemonic);
    }, []);

    const onSaved = async () => {
        const mnemonic = words.split(' ');
        const shuffled = _.shuffle(mnemonic);
        Actions[VERIFY_PHRASE]({ shuffled });
    };

    return (
        <Layout title="Seed Phrase">
            <Text style={style.title}>
                Please carefully write down each word
            </Text>
            <WordCard words={words} />
            <Button color="transparent-grey" onPress={() => Clipboard.setString(words)} style={{ marginTop: 10 }}>
                {'Copy to clipboard\u00A0'}
                <Icon name="copy" />
            </Button>
            <Button color="primary" onPress={onSaved}>
                I have saved my seed words
            </Button>
            <Button color="transparent-grey" onPress={() => onRemind(words)}>
                Remind me later
            </Button>
        </Layout>
    );
};

export default SeedPhraseGenerated;

const style = StyleSheet.create ({
    title: {
        marginTop: 32,
        marginBottom: 16,
        textAlign: 'center',
        color: BLACK_COLOR_OPACITY(0.8)
    }
});
