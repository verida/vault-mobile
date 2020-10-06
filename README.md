# Installation
Remove `yarn.lock` and `https://github.com/verida/wallet-utils` from `package.json`
### Run the following commands:
1. `yarn`
2. `yarn add https://github.com/verida/wallet-utils.git`
3. `npx rn-nodeify --install --hack --yarn` (twice)
### For iOS you should also run:
1. `cd ios`
2. `pod install`

# To run on iOS
1. Open `myApp.xcworkspace` in xCode
2. Click `Pods -> Build phases -> Compile Sources`
3. Find `react-native-udp` and remove `GCDAsyncUdpSocket.m`
4. Find `TcpSockets` and remove `GCDAsyncSocket.m`
5. Run the app in xCode

# To run on Android

## Customize android settings
1. Download and put this file in `vault-mobile/android/app` folder: https://raw.githubusercontent.com/facebook/react-native/master/template/android/app/debug.keystore
2. To fix the memory issue, add to `gradle.properties` file `org.gradle.jvmargs=-Xmx4608m`
3. You should install `adb`:
- `sudo apt update`
- `sudo apt install android-tools-adb android-tools-fastboot`

## To run in Android emulator
1. You should install `android studio`
2. `export ANDROID_HOME=/home/user/Android/Sdk` or specify `local.properties` file in `vault-mobile/android` dir with: `sdk.dir = /home/user/Android/Sdk`
3. `yarn start`
4. `react-native run-android --deviceId emulator-5554`

## To run app on your Android device
1. Put your android device in dev mode. Enable debug and installing app via usb.
2. Connect you phone and enable file transfer
3. Check if device is connected: `adb devices -l`
4. Run in terminal `lsusb` command and copy first 4 numbers of ID
`Bus 001 Device 014: ID 2717:ff48`
5. Run `echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="2717", MODE="0666", GROUP="plugdev"' | sudo tee /etc/udev/rules.d/51-android-usb.rules`
6. `yarn start`
7. `yarn run android`