import React, { useState, useEffect } from "react";
import {View, StyleSheet} from "react-native";

import ProfileLayout from "../../components/Layouts/ProfileLayout";
import Text from "../../components/Text";

import { getWalletInfo } from "../../api";
import { editable } from "../../helpers/profile";

const list = [
    { label: "Name", value: "Chris Were", action: "arrow", type: "input" },
    { label: "Email", value: "chris.were@gmail.com", action: "arrow", type: "input" },
    { label: "Phone", value: "+61 (214) 428-346", action: "arrow", type: "phone" },
    { label: "Date of Birth", value: "03/03/86", action: "arrow" },
    { label: "Address", value: "Not Set", action: "arrow", type: "input" }
];

export default () => {
    const [info, setInfo] = useState({});
    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const data = await getWalletInfo();
        setInfo(data);
    };

    const UserInfo =
        <View>
            <Text style={style.user}>{ info.username || "[Name Surname]" }</Text>
            <Text style={style.did}>{ info.address }</Text>
        </View>

    return (
        <ProfileLayout
            userInfo={UserInfo}
            list={editable(list)}
            description={"This profile is private, but can be requested and shared with your consent"} />
    )
}

const style = StyleSheet.create({
   user: {
       fontWeight: "800",
       fontSize: 22,
       textAlign: "center"
   },
   did: {
       marginTop: 4,
       fontWeight: "800",
       fontSize: 14,
       opacity: 0.6,
       textAlign: "center",
       marginBottom: 24
   }
});
