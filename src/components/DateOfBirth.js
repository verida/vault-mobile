import React, { useState } from 'react';
import DatePicker from 'react-native-datepicker';
import { StyleSheet } from 'react-native';
import { BLACK_COLOR_OPACITY, PRIMARY_COLOR, WHITE_COLOR } from '../constants/color';

export default ({ selected }) => {
    const [value, setValue] = useState(selected);

    return (
        <DatePicker
            style={{ height: 20 }}
            date={value}
            mode="date"
            placeholder="Not set"
            format="DD/MM/YY"
            showIcon={false}
            confirmBtnText="Save Changes"
            cancelBtnText="Cancel"
            useNativeDriver={true}
            customStyles={style}
            onDateChange={(date) => {setValue(date);}}
        />
    );
};

const text = {
    color: BLACK_COLOR_OPACITY(0.6),
    fontFamily: 'NunitoSans',
    fontSize: 17
};

const style = StyleSheet.create({
    dateInput: {
        alignItems: 'flex-end',
        borderWidth: 0,
        marginRight: 26,
        marginTop: -14
    },
    btnConfirm: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 4,
        margin: 4,
        height: 34
    },
    btnTextConfirm: {
        color: WHITE_COLOR,
        fontSize: 14
    },
    placeholderText: text,
    dateText: text
});
