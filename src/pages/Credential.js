import React from "react";
import {View} from "react-native";

import Layout from "../components/Layouts/Layout";
import CredentialCard from "../components/CredentialList/CredentialCard";
import CredentialDetails from "../components/CredentialDetails";

import StyleDivider from "../styles/divider";

export default ({ credential }) => (
    <Layout>
        <CredentialCard item={credential} style={{marginTop: 24, marginBottom: 24}} />
        <View style={StyleDivider.divider} />
        <CredentialDetails />
    </Layout>
)
