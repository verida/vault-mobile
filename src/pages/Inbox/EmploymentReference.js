import React from "react";
import {View, Image, StyleSheet} from "react-native";
import Layout from "../../components/Layouts/Layout";
import Text from "../../components/Text";
import {BLACK_COLOR_OPACITY, LIGHTGREY_COLOR} from "../../constants/color";
import FileSvg from "../../assets/inbox/file.svg";

export default ({ id }) => {
    return (
        <Layout>
            <Text style={style.title}>Employment Reference</Text>
            <View style={style.card}>
                <Image style={style.logo} source={{ uri: "http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png" }} />
                <View style={style.tile}>
                    <Text style={style.organization}>IBM HR</Text>
                    <Text style={style.text}>May 25</Text>
                </View>
            </View>
            <View style={style.info}>
                <View style={{...style.section, marginBottom: 22}}>
                    <Text style={style.label}>Company name</Text>
                    <Text style={style.value}>IBM</Text>
                </View>
                <View style={{...style.section, marginBottom: 22}}>
                    <Text style={style.label}>Position</Text>
                    <Text style={style.value}>Manager</Text>
                </View>
                <View style={{...style.section, marginBottom: 22}}>
                    <Text style={style.label}>Start Date</Text>
                    <Text style={style.value}>22/10/2016</Text>
                </View>
                <View style={{...style.section, marginBottom: 22}}>
                    <Text style={style.label}>End Date</Text>
                    <Text style={style.value}>11/02/2018</Text>
                </View>
                <View style={style.divider} />
                <View style={{flexDirection: "row"}}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 0.5 }}>
                        <FileSvg />
                        <View style={{paddingLeft: 12}}>
                            <Text style={{fontFamily: "AvenirBold", fontSize: 15}}>File.pdf</Text>
                            <Text style={{fontSize: 13}}>200 mb</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 0.5 }}>
                        <FileSvg />
                        <View style={{paddingLeft: 12}}>
                            <Text style={{fontFamily: "AvenirBold", fontSize: 15}}>File.pdf</Text>
                            <Text style={{fontSize: 13}}>200 mb</Text>
                        </View>
                    </View>
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
    card: {
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center"
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderColor: LIGHTGREY_COLOR,
        borderWidth: 1
    },
    tile: {
        marginLeft: 16
    },
    organization: {
        fontFamily: "AvenirBold",
        fontSize: 17,
        lineHeight: 28
    },
    info: {
        borderColor: LIGHTGREY_COLOR,
        borderWidth: 1,
        borderRadius: 4,
        paddingVertical: 22,
        paddingHorizontal: 16,
        flexDirection: "row"
    },
    text: {
        color: BLACK_COLOR_OPACITY(0.6),
        fontSize: 13
    },
    label: {
        color: BLACK_COLOR_OPACITY(0.6),
        fontSize: 15
    },
    value: {
        fontSize: 17,
        marginTop: 4
    },
    divider: {
        height: 1,
        backgroundColor: LIGHTGREY_COLOR,
        marginBottom: 24
    }
});
