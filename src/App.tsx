import './global';

import React, { useState } from 'react';
import { Provider } from 'react-redux';

import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';

import store from 'store';
import { isAuthorized } from 'api';
import Authenticate from 'pages/Authentication/Authenticate';
import Routes from 'routes';

function App() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const loadFonts = async () => {
    const NunitoSans = require('./assets/fonts/NunitoSans-Regular.ttf');
    const NunitoSansSemiBold = require('./assets/fonts/NunitoSans-SemiBold.ttf');
    const NunitoSansBold = require('./assets/fonts/NunitoSans-Bold.ttf');

    return Promise.all([
      Font.loadAsync({ NunitoSans }),
      Font.loadAsync({ NunitoSansSemiBold }),
      Font.loadAsync({ NunitoSansBold })
    ]);
  };

  const init = async () => {
    await loadFonts();
    const data = await isAuthorized();
    setAuthorized(data);
  };

  const routes = authorized
    ? <Authenticate><Routes authorized={authorized} /></Authenticate>
    : <Routes authorized={authorized} />;

  const AppContent =
        <Provider store={store}>
          {routes}
        </Provider>;

  return (loading ?
    <AppLoading
      startAsync={init}
      onFinish={() => setLoading(false)}
      onError={console.warn} /> :
    AppContent
  );
}

export default App;
