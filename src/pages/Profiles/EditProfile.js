import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Container, Content } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';

import Label from '../../components/Label';
import Button from '../../components/Button';

import InputStyles from '../../styles/inputs';
import { COUNTRIES } from '../../helpers/country-list';
import DropDownPicker from '../../components/Select';
import NavigationHeader from '../../components/Navigation/NavigationHeader';
import { setPublicProfileData } from '../../store/general/actions';

import IntlPhoneInput from 'react-native-intl-phone-input';
import { getVault } from '../../api';

const EditProfile = ({ title, option, ...props }) => {
    // const [phoneInputRef, setPhoneInputRef] = useState(null);

    const [disabled, setDisabled] = useState(false);
    const [edited, setEdited] = useState(option.value);
    const onChangeItem = (e) => setEdited(e);

    const saveValue = async () => {
        const key = title.toLowerCase();
        const val = (edited.value || edited).trim();

        if (props.publicProfileData[key] === val) return Actions.pop();
        setDisabled(true);
        const vault = await getVault();

        await vault.profiles.public.set(key, val);
        props.setPublicProfileData({ ...props.publicProfileData, [key]: val });
        return Actions.pop();
    };

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
                <Button disabled={disabled} onPress={saveValue}>Save Changes</Button>
            </Content>
        </Container>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        setPublicProfileData: data => dispatch(setPublicProfileData(data)),
    };
};

const mapStateToProps = state => {
    return { publicProfileData: state.publicProfileData };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);
