import React from 'react'
import Button from "../components/Button";
import Layout from "../components/Layouts/Layout";
import Words from "../components/Words";
import {Actions} from "react-native-router-flux";
import {SUCCESS} from "../constants/route";

const onConfirm = () => Actions[SUCCESS]();

export default ({ words }) => {
    return (
        <Layout title="Verify Your Phrase">
            <Words words={words} />
            <Button style={{marginTop: 99}} color="primary" onPress={onConfirm}>
                Confirm
            </Button>
            <Button style={{marginTop: 10}} color="transparent">
                Clear
            </Button>
        </Layout>
    )
};
