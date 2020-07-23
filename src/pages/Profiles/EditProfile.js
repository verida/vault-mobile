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
                        onChangeText={setEdited} /> }
                { option.type === "select" &&
                    <DropDownPicker
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
                        onChangeText={setEdited} /> }
                { option.type === "phone" &&
                    <IntlPhoneInput
                        onChangeText={onChangeItem}
                        defaultCountry="SG" /> }
            </View>
            <Button style={{bottom: 16}}>Save Changes</Button>
        </Layout>
    )
}
