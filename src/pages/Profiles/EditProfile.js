import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Container, Content } from 'native-base';

import Label from '../../components/Label';
import Button from '../../components/Button';

import InputStyles from '../../styles/inputs';
import { COUNTRIES } from '../../helpers/country-list';
import DropDownPicker from '../../components/Select';
import NavigationHeader from '../../components/Navigation/NavigationHeader';

import IntlPhoneInput from 'react-native-intl-phone-input';

export default ({ title, option }) => {
    // const [phoneInputRef, setPhoneInputRef] = useState(null);

    const [edited, setEdited] = useState(option.value);
    const onChangeItem = (e) => setEdited(e);

    return (
        <Container>
            <NavigationHeader title={ title } />
            <Content contentContainerStyle={{ flex: 1, margin: 20, justifyContent: 'space-between' }}>
                <View>
                    <Label>{ option.label }</Label>
                    { option.type === 'input' &&
                        <TextInput
                            placeholder={`Enter the ${option.label}`}
                            style={InputStyles.input}
                            value={edited}
                            autoFocus={true}
                            onChangeText={setEdited} /> }
                    { option.type === 'select' &&
                        <DropDownPicker
                            autoFocus={true}
                            isVisible={true}
                            searchable={true}
                            searchablePlaceholder="Search..."
                            placeholder=""
                            items={COUNTRIES}
                            defaultValue={option.value}
                            containerStyle={InputStyles.select}
                            onChangeItem={onChangeItem}
                        /> }
                    { option.type === 'textarea' &&
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
                    { option.type === 'phone' &&
                        <IntlPhoneInput
                            // ref={el => setPhoneInputRef(el)}
                            containerStyle={{ ...InputStyles.input, paddingVertical: 4 }}
                            onChangeText={onChangeItem}
                            defaultCountry="SG" /> }
                </View>
                <Button >Save Changes</Button>
            </Content>
        </Container>
    );
};
