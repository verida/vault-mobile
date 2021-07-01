import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import SendSvg from '../../assets/icons/send.svg';
import ReceiveSvg from '../../assets/icons/receive.svg';
import AddSvg from '../../assets/icons/add.svg';
import Text from '../../components/Text';

export const ActionButtonType = {
    SEND: 'send',
    RECEIVE: 'receive',
    TOPUP: 'topup',
};

const getDataFromType = (type) => {
    switch (type) {
    case ActionButtonType.RECEIVE:
        return {
            icon: <ReceiveSvg/>,
            text: 'Receive'
        };
		
    case ActionButtonType.TOPUP:
        return {
            icon: <AddSvg/>,
            text: 'Top up'
        };
		
    default:
        return {
            icon: <SendSvg/>,
            text: 'Send'
        };
    }
};

function ActionButton(props) {
    const { style, type = ActionButtonType.SEND, ...rest } = props;
    const { icon, text } = getDataFromType(type);
    
    return (
        <TouchableOpacity style={[styles.container, style]} {...rest}>
            {icon}
            <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    text: {
        marginTop: 5,
        color: 'white'
    }
});

export default ActionButton;
