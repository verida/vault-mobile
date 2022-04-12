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

## To generate a release Android build
1. Contact project manager to get the keystore file. The file name should be `verida-vault.keystore`
2. Paste the keystore file into `./android/app` folder
3. Set keystore password to global `gradle.properties` file:
```
cd ~/Users/[your_user_name]/.gradle
nano gradle.properties
```
Paste these 2 variables in
```
MYAPP_UPLOAD_STORE_PASSWORD=[your_password]
MYAPP_UPLOAD_KEY_PASSWORD=[your_password]
```
(Contact project manager to get`[your_password]`)
4. Run these commands:
```
cd android
./gradlew assembleStagingRelease
```
4. Get the APK generated in `./android/app/build`

## Instruction to get app running on Apple M1 macs

Prerequisites: you need to have node, watchman, etc installed, best to follow the setting up development environment instructions here for Mac and iOS and get a bare react native app working:
https://reactnative.dev/docs/environment-setup

To get started you will git clone the `vault-mobile` repo on your hard drive.

Next run `yarn` in the vault-mobile directory to install dependencies.

Next step is to navigate to `ios` directory and run `pod install`, this is where you will run into your first issue, this will fail.

To fix this you need to install `ffi`, run the following command:

`sudo arch -x86_64 gem install ffi`

Now install the pods using the following command:

`arch -x86_64 pod install`

source: https://stackoverflow.com/questions/64901180/running-cocoapods-on-apple-silicon-m1

Now if you try to run the project in xcode you will get about ~100 errors. to fix that you need to run xcode in rosetta mode, to do that go to your Mac's applications folder, find Xcode, right click, click "Get Info" and check the checkbox labeled 'Open using Rosetta'.

Now go into xcode, clean the build folder and run the app.