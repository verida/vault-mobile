# Remote Config

A built-in configuration of the Verida Wallet is define when building the application. If we need to update some of the values in the configuration, we can do use the Firebase remote config instead of/before release and deploying a new app version.

## Configuration structure

The remote configuration coming from Firebase is merged with the built-in configuration. The remote values taking priority over the built-in ones.

The remote configuration must have the same structure as the built-in one. It should look like as below, but check `src/config/index.ts` to get the up-to-date structure.

```json
{
  "features": {
    "veridaMainnet": {},
    "home": {}
  },
  "verida": {
    "local": {},
    "devnet": {},
    "testnet": {},
    "mainnet": {}
  },
  "walletProvider": {},
  "dataConnector": {},
  "blockchain": {},
  "walletConnect": {},
  "polygonId": {
    "common": {},
    "testnet": {},
    "mainnet": {}
  }
}
```

All values in the remote configuration are optional, **only define the ones needing to be overriden**. For instance:

```json
{
  "verida": {
    "testnet": {
      "rpcUrl": "https://the-updated-rpc-url"
    }
  }
}
```

## Set up in Firebase

Once you have defined the subset of configuration to push remotely, go to the [Firebase console](https://console.firebase.google.com/project/verida-vault/config)

- Select `wallet_app_config` item and edit it

![Select wallet_app_config](../../images/firebase-remote-config-1.png)

- Expand the JSON editor

![Config JSON editor](../../images/firebase-remote-config-2.png)

- Add the value for the updated configuration

![Config JSON editor](../../images/firebase-remote-config-3.png)

- Save and publish changes

![Config JSON editor](../../images/firebase-remote-config-4.png)

Done, now the clients will receive the config update OTA and merge it with the built-in one. Users will be asked to restart the application to take the merged configuration into account.
