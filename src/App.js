import './global'

import React, { useState } from "react";
import { Provider } from "react-redux";

import { AppLoading } from "expo";
import * as Font from "expo-font";

import Routes from "./routes";
import store from "./store";

// import { testVeridaConnect } from "./api/verida";

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

    const init = async () => {
        await loadFonts();
        // await testVeridaConnect();
    };

    const App =
        <Provider store={store}>
            <Routes />
        </Provider>;

    return (loading ?
        <AppLoading
            startAsync={init}
            onFinish={() => setLoading(false)}
            onError={console.warn} /> :
        App
    )
};
