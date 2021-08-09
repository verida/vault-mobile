import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import Text from '../Text';
import { BLACK_COLOR, BLACK_COLOR_OPACITY } from '../../constants/color';

export default class CustomTabBar extends React.Component {
    render() {
        const { state } = this.props.navigation;
        const activeTabIndex = state.index;

        const tabClick = (key) => {
            // Actions['_' + key]()
        }

        return (
            <View style={style.navigation}>
                {
                    state.routes.map(({ key, routes: [props] }, index) => (
                        <TouchableOpacity key={key} onPress={() => tabClick(key)} style={style.tab}>
                            { props.params.icon({ opacity: (index === activeTabIndex ? 1 : 0.45) }) }
                            <Text style={[style.tabText, index === activeTabIndex && style.tabTextActive]}>
                                {props.params.title}
                            </Text>
                        </TouchableOpacity>
                    )
                    )
                }
            </View>
        );
    }
}

const style = StyleSheet.create({
    navigation: {
        flexDirection: 'row',
        height: 83,
        borderTopWidth: 0.4,
        borderTopColor: BLACK_COLOR_OPACITY(0.2)
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.92)'
    },
    tabText: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 6,
        lineHeight: 12,
        color: BLACK_COLOR_OPACITY(0.52),
        textAlign: 'center'
    },
    tabTextActive: {
        color: BLACK_COLOR
    }
});
