import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Container, Content } from 'native-base';
import EmploymentData from '../../components/Inbox/EmploymentData';
import Attachment from '../../components/Inbox/Attachment';
import NavigationHeader from 'components/Navigation/NavigationHeader';

import RequestDetailsLayout from '../../components/Inbox/RequestDetailsLayout';
import { LIGHTGREY_COLOR } from '../../constants/color';

import StyleDivider from '../../styles/divider';

const file = {
    title: 'File.pdf',
    size: '200 mb'
};

const company = {
    uri: 'http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png',
    name: 'IBM HR',
    createdAt: 'May 25',
    type: 1
};

export default ({ id }) => {
    return (
        <Container>
            <NavigationHeader title="Request details" />
            <Content>
                <RequestDetailsLayout company={company}>
                    <View style={style.info}>
                        <View style={{ flexDirection: 'row', marginBottom: 23 }}>
                            <EmploymentData label="Company name" value="IBM" />
                            <EmploymentData label="Start Date" value="22/10/2016" />
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 23 }}>
                            <EmploymentData label="Position" value="Manager" />
                            <EmploymentData label="End Date" value="11/02/2018" />
                        </View>
                        <View style={StyleDivider.divider} />
                        <View style={{ flexDirection: 'row' }}>
                            <Attachment options={file} />
                            <Attachment options={file} />
                        </View>
                    </View>
                </RequestDetailsLayout>
            </Content>
        </Container>
    );
};

const style = StyleSheet.create({
    info: {
        borderColor: LIGHTGREY_COLOR,
        borderWidth: 1,
        borderRadius: 4,
        paddingVertical: 22,
        paddingHorizontal: 16,
    }
});
