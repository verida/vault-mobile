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
import VeridaClient from '@verida/client-rn'
import { Utils } from '@verida/3id-utils-node'
import { AutoAccount } from '@verida/account'
import { IDX } from '@ceramicstudio/idx'

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
    await loadFonts()
    const startTime = Date.now()
    try {
      const client = new VeridaClient({
        defaultDatabaseServer: {
          type: 'VeridaDatabase',
          endpointUri: 'http://192.168.1.4:5000/',
        },
        defaultMessageServer: {
          type: 'VeridaMessage',
          endpointUri: 'http://192.168.1.4:5000/',
        },
        ceramicUrl: 'https://gateway-clay.ceramic.network/',
      })
      console.log('1')

      // establish an authorized Ceramic connection for a given Ethereum private key
      const ETH_PRIVATE_KEY =
        '0x48d3b996ec98a9a536efdffbae40e5eaaf117765a587483c69195c9460165c8f'
      const utils = new Utils()
      console.log('2')
      const ceramic = await utils.createAccount('ethr', ETH_PRIVATE_KEY)
      console.log('3')
      // create a Verida account instance that wraps the authorized Ceramic connection
      // The `AutoAccount` instance will automatically sign any consent messages (useful for testing)
      const account = new AutoAccount(ceramic)
      const did = await account.did()
      console.log('did:', did)
      console.log('4')
      //
      // // Connect the Verida account to the Verida client
      await client.connect(account)
      console.log('5')
      console.log('account:', account)

      const idx = new IDX({ ceramic })
      const secureContexts = await idx.get(
        'kjzl6cwe1jw145l8jya7g6cuyluj17xlyc6t7p6iif12isbi1ppu5cuze4u3njc',
        'did:3:kjzl6cwe1jw147m081v418jzm75idwsovntx4f6xk3vbyqu1x9w9arv8i4uywz7'
      )
      console.log(secureContexts)
      // // Open an application context
      const context = await client.openContext('Verida: Vault', true)
      console.log('6')
      console.log('context:', context)
      //
      // // Open a database
      const database = await context.openDatabase('my_database')
      console.log('7')
      console.log('database:', database)
      const endTime = Date.now()
      console.log('TIME:', endTime - startTime)
    } catch (error) {
      console.log(error)
    }
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
