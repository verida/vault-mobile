import './global'

import React, { useState } from 'react'
import { Provider } from 'react-redux'

import AppLoading from 'expo-app-loading'
import * as Font from 'expo-font'

import store from 'reduxStore'
import { NavigationContainer } from '@react-navigation/native'
import RootNavigator from 'navigation/RootNavigator'
import Authenticate from 'pages/Authentication/Authenticate'
import { AuthProvider } from 'hooks/useAuth'
import linking from 'navigation/linkingConfiguration'
import { AutoAccount } from '@verida/account-node'
import { Client } from '@verida/client-rn'

const CONTEXT_NAME = 'Verida: Vault'
const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com'

function App() {
  const [loading, setLoading] = useState(true)

  const loadFonts = async () => {
    const NunitoSans = require('./assets/fonts/NunitoSans-Regular.ttf')
    const NunitoSansSemiBold = require('./assets/fonts/NunitoSans-SemiBold.ttf')
    const NunitoSansBold = require('./assets/fonts/NunitoSans-Bold.ttf')

    return Promise.all([
      Font.loadAsync({ NunitoSans }),
      Font.loadAsync({ NunitoSansSemiBold }),
      Font.loadAsync({ NunitoSansBold }),
    ])
  }

  const init = async () => {
    console.log('app init')
    await loadFonts()
    // try {
    //   // establish a network connection
    //   const client = new Client({
    //     defaultDatabaseServer: {
    //       type: 'VeridaDatabase',
    //       endpointUri: 'http://localhost:5000/',
    //     },
    //     defaultMessageServer: {
    //       type: 'VeridaMessage',
    //       endpointUri: 'http://localhost:5000/',
    //     },
    //     ceramicUrl: CERAMIC_URL,
    //   })
    //   console.log('client:', client)
    //
    //   // establish an authorized Ceramic connection for a given Ethereum private key
    //   const ETH_PRIVATE_KEY =
    //     '0x78d3b996ec98a9a536efdffbae40e5eaaf117765a587483c69195c9460165c8f'
    //
    //   // create a Verida account instance that wraps the authorized Ceramic connection
    //   // The `AutoAccount` instance will automatically sign any consent messages
    //   const account = new AutoAccount('ethr', ETH_PRIVATE_KEY, CERAMIC_URL)
    //   console.log('account:', account)
    //
    //   // Connect the Verida account to the Verida client
    //   await client.connect(account)
    //   console.log('connected')
    //
    //   // Open an application context (forcing creation of a new context if it doesn't already exist)
    //   const context = await client.openContext(CONTEXT_NAME, true)
    //   console.log('context:', context)
    //
    //   // Open a database
    //   const database = await context.openDatabase('my_database')
    //   console.log('database:', database)
    // } catch (error) {
    //   console.log(error)
    // }
  }

  const AppContent = (
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <Authenticate>
            <RootNavigator />
          </Authenticate>
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  )

  return loading ? (
    <AppLoading
      startAsync={init}
      onFinish={() => setLoading(false)}
      onError={console.warn}
    />
  ) : (
    AppContent
  )
}

export default App
