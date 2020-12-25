import React, { useEffect, useState } from 'react';
//import { Actions } from 'react-native-router-flux';
import { View, StyleSheet } from 'react-native';

import DataGridList from './DataGridList'
import { getVault } from '../../api'

import {
    DATA_ITEM
} from '../../constants/route';


export default ListView = ({ folder }) => {
    const [list, setList] = useState([]);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const vault = await getVault();
        const items = await folder.getMany();

        setList(items)
    };

    return (
        <View>
            <View style={style.itemsList}>
                <DataGridList list={list} folder={folder} />
            </View>
        </View>
    );
};

const style = StyleSheet.create({
    itemsList: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 15,
        marginRight: 15
    },
});