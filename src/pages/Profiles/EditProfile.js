import React, { useState } from "react";
import {View, TextInput} from "react-native";
import Label from "../../components/Label";
import Layout from "../../components/Layouts/Layout";
import Button from "../../components/Button";

import InputStyles from "../../styles/inputs";
import {COUNTRIES} from "../../helpers/country-list";
import DropDownPicker from "../../components/Select";

import IntlPhoneInput from 'react-native-intl-phone-input';

export default ({ option }) => {
    // const [selectRef, setSelectRef] = useState(null);
    // const [phoneInputRef, setPhoneInputRef] = useState(null);

    const [edited, setEdited] = useState(option.value);
    const onChangeItem = (e) => setEdited(e);

    return (
        <Layout style={{flex: 1, justifyContent: "space-between"}}>
            <View>
                <Label>{ option.label }</Label>
                { option.type === "input" &&
                    <TextInput
                        placeholder={`Enter the ${option.label}`}
                        style={InputStyles.input}
                        value={edited}
                        autoFocus={true}
                        onChangeText={setEdited} /> }
                { option.type === "select" &&
                    <DropDownPicker
                        // ref={el => setSelectRef(el)}
                        isVisible={true}
                        searchable={true}
                        searchablePlaceholder="Search..."
                        placeholder=""
                        items={COUNTRIES}
                        defaultValue={option.value}
                        containerStyle={InputStyles.select}
                        onChangeItem={onChangeItem}
                    /> }
                { option.type === "textarea" &&
                    <TextInput
                        placeholder={`Enter the ${option.label}`}
                        style={InputStyles.textarea}
                        value={edited}
                        multiline
                        numberOfLines={4}
                        maxLength={255}
                        editable
                        autoFocus={true}
                        onChangeText={setEdited} /> }
                { option.type === "phone" &&
                    <IntlPhoneInput
                        // ref={el => setPhoneInputRef(el)}
                        containerStyle={{...InputStyles.input, paddingVertical: 4}}
                        onChangeText={onChangeItem}
                        defaultCountry="SG" /> }
            </View>
            <Button style={{bottom: 16}}>Save Changes</Button>
        </Layout>
    )
}
