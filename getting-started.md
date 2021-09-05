# Background information

The vault is a `react-native` mobile application originally built in Expo. Due to the many complex dependencies, it is necessary to run the application in [ejected mode](https://docs.expo.io/bare/customizing/). This has already been done in the code base.

It's intended for the application to support Android and iOS, however **iOS development is being prioritized**.

The code has two Verida libraries dependencies:

- **verida/datastore**: This dependency uses the `react-native` branch of the datastore library. Debugging this react-native branch is very difficult as react-native applications don't respect `yarn link`. As such, to debug an issue you will need to manually edit the `datastore` files in `node_modules/verida/datastore` and then duplicate any changes / fixes in a separate checkout of the `verida/datastore#react-native` repo.
- **verida/vault-common**: This dependency is shared with `vault-web` and provides common functionality required by both vault implementations.

The code uses **yarn** not npm. Using npm will break the dependencies, so avoid it at all costs.

# Getting the code

To get the code, clone the vault-mobile repository from Github and switch to the `develop` branch.

```jsx
git clone https://github.com/verida/vault-mobile
git checkout develop
```

# Building the code

Due to the complex dependencies there's a specific process that needs to be followed to build the code.

## 1. Install dependencies

Note: `npx` command **must** be run twice.

```jsx
yarn install
npx rn-nodeify --install --hack --yarn
npx rn-nodeify --install --hack --yarn
```

## 2. Build iOS

- Open the project in XCode
- Select `Product > Clean build folder` from the menu

```jsx
cd ios
pod install
```

- `pod install` creates duplicated compile sources that need to be removed. Need to remove `GCDAsyncUdpSocket.m` from the following:
    - react-native-udp
    - TcpSockets

![fix duplicated sources](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/1aefbba6-9cfe-436e-b23f-1206188a8bff/fix_duplicated_sources.png)

- Build the application in Xcode. It often fails the first time, so just try again. Sometimes if you have changed dependencies you need to close metro and Xcode and reload the app before building again.

### Dependency Notes

1. If you experience dependency issues, it's strongly recommended to delete `node_modules` and then redo `yarn install`.
2. If you add or update a dependency, you need to repeat the above process.

### Other Issues

1. EMF [Too many files open](https://stackoverflow.com/questions/58675179/error-emfile-too-many-open-files-react-native-cli)

## 3. Build Android

TBA
