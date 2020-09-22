import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';

import Button from '../../components/Button';
import Layout from '../../components/Layouts/Layout';
import Words from '../../components/Words';

import { resetPhrase } from '../../store/words/actions';
import ErrorPhrase from '../../components/ErrorPhrase';
import { onRemind } from '../../helpers/account';

import { SUCCESS } from '../../constants/route';
import { MNEMONIC_LENGTH, walletByMnemonic } from '../../api';

const VerifyPhrase = ({ words, shuffled, mnemonic, ...props }) => {
    const [error, showError] = useState(null);
    const [verified, setVerified] = useState(null);

    useEffect(() => {
        showError(false);
        setVerified(words.length === MNEMONIC_LENGTH);
    }, [words]);
    useEffect(() => {
        return () => {
            props.resetPhrase();
        };
    }, []);

    const onConfirm = async () => {
        try {
            const phrase = words.join(' ');
            await walletByMnemonic(phrase);
            props.resetPhrase();
            Actions[SUCCESS]();
        } catch (e) {
            showError(true);
            console.log(e.message);
        }
    };

    return (
        <Layout title="Verify Your Phrase" style={style.layout}>
            <View>
                <Words words={shuffled} />
                <ErrorPhrase shown={error} style={style.error} />
            </View>
            <View>
                { !verified &&
                    <Button style={{ marginTop: 20 }} color="transparent-grey" onPress={() => onRemind(mnemonic)}>
                        Skip
                    </Button> }
                { verified && <>
                    <Button style={{ marginTop: 20 }} color="primary" onPress={onConfirm}>
                        Confirm
                    </Button>
                    <Button style={{ marginTop: 10 }} color="transparent-grey" onPress={props.resetPhrase}>
                        Clear
                    </Button>
                </>}
            </View>
        </Layout>
    );
};


const mapStateToProps = state => {
    return {
        words: state.template,
        mnemonic: state.mnemonic
    };
};

const mapDispatchToProps = dispatch => {
    return {
        resetPhrase: () => dispatch(resetPhrase())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(VerifyPhrase);

const style = StyleSheet.create({
    error: {
        textAlign: 'center',
        marginTop: 20
    }
});
