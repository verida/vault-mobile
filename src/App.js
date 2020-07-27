import './global'

import React, { useState } from "react";
import { AppLoading } from "expo";
import * as Font from "expo-font";
import Routes from "./routes";

export default () => {
    const [loading, setLoading] = useState(true);

    const loadFonts = async () => {
        const Avenir = require("./assets/fonts/Avenir.otf");
        const AvenirBold = require("./assets/fonts/Avenir-Bold.ttf");

        return Promise.all([
            Font.loadAsync({ Avenir }),
            Font.loadAsync({ AvenirBold })
        ]);
    };

    return (loading ?
        <AppLoading
            startAsync={loadFonts}
            onFinish={() => setLoading(false)}
            onError={console.warn} /> :
        <Routes />)
};
