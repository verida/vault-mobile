# Installation
### Run the following commands:
1. Replace `client-rn` path in **package.json** with your local `client-rn` path.
2. `yarn`
3. `npx pod-install`

## Integrate with client-rn
1. Make sure you are on the right branch of client-rn and verida-js
2. Run this command on your project's root directory:

`./scripts/integrate-client-rn.sh [verida-js path] [client-rn path]`
3. Terminate metro bundler process (if it's running) and run the app again.
4. Note: Ceramic may not work correctly if you turn on Network Inspector in your React Native Debugger.

## Customize android settings
1. Download and put this file in `vault-mobile/android/app` folder: https://raw.githubusercontent.com/facebook/react-native/master/template/android/app/debug.keystore
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
