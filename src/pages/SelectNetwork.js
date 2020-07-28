import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import {Actions} from "react-native-router-flux";

import Layout from "../components/Layouts/Layout";
import NetworkItem from "../components/NetworkItem";
import Button from "../components/Button";

import {SEED_PHRASE_ENTERED} from "../constants/route";
import {NETWORKS} from "../helpers/networks";

const onContinue = () => Actions[SEED_PHRASE_ENTERED]();

export default () => {
    const [selected, setSelected] = useState(null);

    return (
        <Layout title="Select Network">
            { NETWORKS.map(network =>
                    <TouchableOpacity key={network.id} onPress={() => setSelected(network.id)}>
                        <NetworkItem
                            selected={network.id === selected}
                            onSelect={setSelected}
                            network={network} />
                    </TouchableOpacity>
                )
            }
            <Button style={{marginTop: 24}}
                color="primary"
                onPress={onContinue}
                disabled={!selected}>
                Continue
            </Button>
        </Layout>
    )
}
