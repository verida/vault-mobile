import React from "react";
import {View, Image, StyleSheet} from "react-native";
import Layout from "../../components/Layouts/Layout";
import Text from "../../components/Text";
import EmploymentData from "../../components/Inbox/EmploymentData";
import Attachment from "../../components/Inbox/Attachment";

import {LIGHTGREY_COLOR} from "../../constants/color";
import Description from "../../components/Inbox/Description";

const file = {
    title: "File.pdf",
    size: "200 mb"
};
const company = {
    uri: "http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png",
    name: "IBM HR",
    createdAt: "May 25"
};

export default ({ id }) => {
    return (
        <Layout>
            <Text style={style.title}>Employment Reference</Text>
            <Description details={company} />
            <View style={style.info}>
                <View style={{flexDirection: "row", marginBottom: 23}}>
                    <EmploymentData label="Company name" value="IBM" />
                    <EmploymentData label="Start Date" value="22/10/2016" />
                </View>
                <View style={{flexDirection: "row", marginBottom: 23}}>
                    <EmploymentData label="Position" value="Manager" />
                    <EmploymentData label="End Date" value="11/02/2018" />
                </View>
                <View style={style.divider} />
                <View style={{flexDirection: "row"}}>
                    <Attachment options={file} />
                    <Attachment options={file} />
                </View>
            </View>
        </Layout>
    );
}

const style = StyleSheet.create({
    title: {
        fontSize: 22,
        lineHeight: 41,
        fontFamily: "AvenirBold",
        marginTop: 24
    },
    info: {
        borderColor: LIGHTGREY_COLOR,
        borderWidth: 1,
        borderRadius: 4,
        paddingVertical: 22,
        paddingHorizontal: 16,
    },
    divider: {
        height: 1,
        backgroundColor: LIGHTGREY_COLOR,
        marginBottom: 24
    }
});
