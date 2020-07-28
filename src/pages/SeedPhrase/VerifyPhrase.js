import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {connect} from "react-redux";

import Button from '../../components/Button';
import Layout from '../../components/Layouts/Layout';
import ErrorPhrase from "../../components/ErrorPhrase";
import Words from '../../components/Words';

import {SUCCESS} from '../../constants/route';
import {resetPhrase} from "../../store/words/actions";
import {walletByMnemonic} from "../../api";

const VerifyPhrase = ({ words, shuffled, ...props }) => {
    const [error, showError] = useState(null);

    useEffect(() => {
        showError(false);
    }, [words]);

    const onConfirm = async () => {
        try {
            const phrase = words.join(" ");
            await walletByMnemonic(phrase);
            Actions[SUCCESS]();
        } catch (e) {
            showError(true);
            console.log(e.message);
        }
    };

    return (
        <Layout title="Verify Your Phrase" style={style.layout}>
            <View style={style.words}>
                <Words words={shuffled} />
                <ErrorPhrase shown={error} />
            </View>
            <View>
                <Button style={{marginTop: 99}} color="primary" onPress={onConfirm}>
                    Confirm
                </Button>
                <Button style={{marginTop: 10}} color="transparent" onPress={props.resetPhrase}>
                    Clear
                </Button>
            </View>
        </Layout>
    )
};


const mapStateToProps = state => {
    return { words: state.template };
};

const mapDispatchToProps = dispatch => {
    return {
        resetPhrase: () => dispatch(resetPhrase())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(VerifyPhrase);

const style = StyleSheet.create({
    words: {
        flex: 1,
        alignItems: "center"
    },
    layout: {
        flex: 1,
        justifyContent: "space-between"
    },
    mt: {
        marginTop: 24
    }
});
