const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com'
const CONTEXT_NAME = 'Verida: Sandbox Demo'
const account = new window.VaultAccount({
  defaultDatabaseServer: {
    type: 'VeridaDatabase',
    endpointUri: 'https://db.testnet.verida.io:5002/'
  },
  defaultMessageServer: {
    type: 'VeridaMessage',
    endpointUri: 'https://db.testnet.verida.io:5002/'
  }
})

const context = await window.Network.connect({
  client: {
    defaultDatabaseServer: {
      type: 'VeridaDatabase',
      endpointUri: 'https://db.testnet.verida.io:5002/'
    },
    defaultMessageServer: {
      type: 'VeridaMessage',
      endpointUri: 'https://db.testnet.verida.io:5002/'
    }
  },
  account: account,
  context: {
    name: CONTEXT_NAME
  }
})

const did = await account.did()
console.log("User is connected with DID: " + did)
