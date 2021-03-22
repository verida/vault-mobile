import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text } from 'react-native'

import DataGridList from './DataGridList'
import { getVault } from '../../api'


export default ListView = ({ folder }) => {
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const vault = await getVault()
        const items = await folder.getMany()

        setList(items)
        setLoading(false)
    };

    return (
        <View>
            { loading ?
                <View style={style.placeholder}><Text>Loading...</Text></View> :
                (
                    list.length ?
                    <View style={style.itemsList}>
                        <DataGridList list={list} folder={folder} />
                    </View> :
                    <View style={style.placeholder}><Text>No results</Text></View>
                )
            }
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
    placeholder: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 15,
        justifyContent: 'center'
    }
});