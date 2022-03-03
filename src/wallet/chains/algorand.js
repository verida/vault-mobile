import algosdk from 'algosdk'

const token = {
  'X-API-key': 'pMDXUFVkGJ7TFkkdORaV84pJEvUOBAvD1w9LTkq6',
}
const baseServer = 'https://testnet-algorand.api.purestake.io/idx2'
const port = ''
const algodServer = 'https://testnet-algorand.api.purestake.io/ps2'
const algodPort = ''

export const indexerClient = new algosdk.Indexer(token, baseServer, port)
export const algodClient = new algosdk.Algodv2(token, algodServer, algodPort)
