# 1.2.0 (2024-03-19)

## Enhancements

- Rework the Polygon ID integration to fix stability issues, improve performance and user experience
- Update Polygon ID status screen in Settings

## Bug Fixes

- Fix crypto wallet balances stuck in loading in some cases
- Fix mock data in unit tests
- Upgrade various dependencies

# 1.1.2 (2024-02-28)

## Bug Fixes

- Fix gas fees when sending transactions on Polygon mainnet
- Fix/Improve display of error messages when crypto transactions fail

# 1.1.1 (2024-02-15)

## Bug Fixes

- Fix incorrect price of coins in some circumstances
- Fix navigating back between data folder screens

# 1.1.0 (2024-02-09)

## Enhancements

- Add blockchain mainnets support for Ethereum and Polygon
- Update UI for blockchain-related features
- Add blockchain networks (mainnet and testnet) details in the Settings
- Small UI changes in the Identity drawer

## Bug Fixes

- Fix various bugs on blockchain-related features
- Fix potential vulnerability on local data storage related to the PIN code in the iOS App
- Fix potential vulnerability for hijacking activity/tapjacking attack on Android
- Fix bug on notification permission request for Android

# 1.0.3 (2024-02-01)

## Bug Fixes

- Fix incoming data message screen expecting undefined result by @aurelticot in https://github.com/verida/vault-mobile/pull/1252
- Fix PushNotificationManager is not available on Android by @aurelticot in https://github.com/verida/vault-mobile/pull/1253/commits/bb9c4fba694143ec40283973551872b173d089be

## Misc

- Add home promo banner for the community sale by @aurelticot in https://github.com/verida/vault-mobile/pull/1255

# 1.0.2 (2024-01-30)

## Bug Fixes

- fix: fix react-native-screens causes crashes on Android by @andy-verida in https://github.com/verida/vault-mobile/pull/1238
- Fix Verida vulnerable to padding Oracle attacks by @andy-verida in https://github.com/verida/vault-mobile/pull/1241

## Misc

- Ignore non-error reported to Sentry by @aurelticot in https://github.com/verida/vault-mobile/pull/1239
- Ignore "Expired refresh token" error by @aurelticot in https://github.com/verida/vault-mobile/pull/1243

# 1.0.1 (2024-01-17)

## Enhancements

- Run the data migration in parallel by @aurelticot in https://github.com/verida/vault-mobile/pull/1204
- Display "Identity not found" modal when switching Identity fails by @andy-verida in https://github.com/verida/vault-mobile/pull/1218

## Bug Fixes

- Fix potential non-string context names during migration by @aurelticot in https://github.com/verida/vault-mobile/pull/1197
- Fix evaluating potentially undefined selectedWallet by @aurelticot in https://github.com/verida/vault-mobile/pull/1193
- Improve Inbox loading time & fix notification issues by @andy-verida in https://github.com/verida/vault-mobile/pull/1207
- Fix handling potential undefined QR code data by @aurelticot in https://github.com/verida/vault-mobile/pull/1201
- Fix message set to read even if action failed by @aurelticot in https://github.com/verida/vault-mobile/pull/1216
- Fix crash when fetching all profiles when there's an unavailable identity by @aurelticot in https://github.com/verida/vault-mobile/pull/1202
- Handle receiving notification sent from Firebase by @aurelticot in https://github.com/verida/vault-mobile/pull/1213

## Misc

- Create documentation for Remote Config by @andy-verida in https://github.com/verida/vault-mobile/pull/1208
- Upgrade Verida client to `3.0.2` by @aurelticot in https://github.com/verida/vault-mobile/pull/1217
- Update Verida SDK dependencies by @aurelticot in https://github.com/verida/vault-mobile/pull/1194
- chore(deps): bump follow-redirects from 1.15.2 to 1.15.4 by @dependabot in https://github.com/verida/vault-mobile/pull/1212
- chore(deps): bump follow-redirects from 1.15.2 to 1.15.4 in /web by @dependabot in https://github.com/verida/vault-mobile/pull/1211
- chore(deps): bump react-native-mmkv from 2.5.1 to 2.11.0 by @dependabot in https://github.com/verida/vault-mobile/pull/1210

# 1.0.0 (2023-12-26)

## Enhancements

- Support new Polygon ID QR code format by @aurelticot in https://github.com/verida/vault-mobile/pull/1106
- Add website property to profile tab + Profile screen refactoring by @aurelticot in https://github.com/verida/vault-mobile/pull/1136
- Update notification message and configuration by @aurelticot in https://github.com/verida/vault-mobile/pull/1144
- Add network selection when adding an identity by @aurelticot in https://github.com/verida/vault-mobile/pull/1131
- Add network indicator UI component by @aurelticot in https://github.com/verida/vault-mobile/pull/1129
- Check network on connection request by @aurelticot in https://github.com/verida/vault-mobile/pull/1167
- Implement Identity drawer by @aurelticot in https://github.com/verida/vault-mobile/pull/1170
- Rework Settings screen by @aurelticot in https://github.com/verida/vault-mobile/pull/1163
- Implement new Home screen by @aurelticot in https://github.com/verida/vault-mobile/pull/1171
- Implement migration Testnet Identity to Mainnet by @aurelticot in https://github.com/verida/vault-mobile/pull/1158
- Implement new Share Identity screen by @aurelticot in https://github.com/verida/vault-mobile/pull/1148

## Bug Fixes

- fix: inbox messages count not shown by @andy-verida in https://github.com/verida/vault-mobile/pull/1164
- Fix: Use correct avatar of sender, include sender profile name by @tahpot in https://github.com/verida/vault-mobile/pull/1166
- fix: opening notification by @andy-verida in https://github.com/verida/vault-mobile/pull/1178
- Small bugs and adjustments by @aurelticot in https://github.com/verida/vault-mobile/pull/1172
- Bugs and Adjustments by @aurelticot in https://github.com/verida/vault-mobile/pull/1180

## Misc

- Rework configuration to support multi network by @aurelticot in https://github.com/verida/vault-mobile/pull/1128
- Upgrade Verida SDK for Mainnet by @andy-verida in https://github.com/verida/vault-mobile/pull/1160
- Update to stable Verida SDK `3.0.0` by @aurelticot in https://github.com/verida/vault-mobile/pull/1187
- Prevent reporting Verida One profile not found error by @aurelticot in https://github.com/verida/vault-mobile/pull/1134
- Prevent reporting error if a Verida username has not been found by @aurelticot in https://github.com/verida/vault-mobile/pull/1135
- Bump axios from 1.3.5 to 1.6.0 in /web by @dependabot in https://github.com/verida/vault-mobile/pull/1101
- Bump axios from 0.24.0 to 1.6.0 by @dependabot in https://github.com/verida/vault-mobile/pull/1100
- chore(deps): bump @adobe/css-tools from 4.3.1 to 4.3.2 in /web by @dependabot in https://github.com/verida/vault-mobile/pull/1127

# 0.6.1 (2023-11-21)

## Bug Fixes

- Fix Android bypass biometric authentication by @andy-verida in https://github.com/verida/vault-mobile/pull/1111
- Implement remote configuration by @andy-verida in https://github.com/verida/vault-mobile/pull/1087
- Fix crypto wallet not loaded following importing an identity by @aurelticot in https://github.com/verida/vault-mobile/pull/1107
- Fix tab bar spacing by @aurelticot in https://github.com/verida/vault-mobile/pull/1099

* Fix incorrect date time in messages by @aurelticot in https://github.com/verida/vault-mobile/commit/eb0f66e4daafd12392b0b9f57363fd347a712a91

## Misc

- Hide the Connections tab (temporarily) by @aurelticot in https://github.com/verida/vault-mobile/pull/1099
- Add timeout on CI workflow by @aurelticot in https://github.com/verida/vault-mobile/pull/1105
- Replace `Sentry.captureException` by `logger.error` in the whole codebase by @aurelticot in https://github.com/verida/vault-mobile/pull/1109
- Remove advertising id permission on Android by @aurelticot in https://github.com/verida/vault-mobile/pull/1110

# 0.6.0 (2023-11-09)

## Enhancements

- Handle receiving crypto payment requests by @aurelticot in https://github.com/verida/vault-mobile/pull/1078

## Misc

- Rework environment variables by @andy-verida in https://github.com/verida/vault-mobile/pull/1062
- Bump zod from 3.22.2 to 3.22.3 by @dependabot in https://github.com/verida/vault-mobile/pull/1077
- Bump undici from 5.21.0 to 5.26.3 in /web by @dependabot in https://github.com/verida/vault-mobile/pull/1079
- Bump @babel/traverse from 7.21.4 to 7.23.2 in /web by @dependabot in https://github.com/verida/vault-mobile/pull/1082
- Bump browserify-sign from 4.2.1 to 4.2.2 in /web by @dependabot in https://github.com/verida/vault-mobile/pull/1086
- Bump undici from 5.21.2 to 5.26.3 by @dependabot in https://github.com/verida/vault-mobile/pull/1080
- Bump @babel/traverse from 7.18.6 to 7.23.2 by @dependabot in https://github.com/verida/vault-mobile/pull/1081
- Bump react-devtools-core from 4.24.7 to 4.28.4 by @dependabot in https://github.com/verida/vault-mobile/pull/1083
- Bump browserify-sign from 4.2.1 to 4.2.2 by @dependabot in https://github.com/verida/vault-mobile/pull/1085

# 0.5.0 (2023-09-19)

## Enhancements

- Optimise and update UI of account creation by @aurelticot in https://github.com/verida/vault-mobile/pull/1056
- Display branding of Polygon ID credential issuers and verifiers by @aurelticot in https://github.com/verida/vault-mobile/pull/1042
- Update credential details screen UI by @aurelticot in https://github.com/verida/vault-mobile/pull/1053
- Support credential revocation status for Cheqd credentials by @aurelticot in https://github.com/verida/vault-mobile/pull/1053

## Misc

- Update Android build target SDK version to 33 by @andy-verida in https://github.com/verida/vault-mobile/pull/1054
- Config using analytics without Apple Ad ID (IDFA) by @andy-verida in https://github.com/verida/vault-mobile/pull/1055
- Bump @adobe/css-tools from 4.2.0 to 4.3.1 in /web by @dependabot in https://github.com/verida/vault-mobile/pull/1050
- Bump activesupport from 6.1.7.3 to 6.1.7.6 by @dependabot in https://github.com/verida/vault-mobile/pull/1041
- Bump protobufjs from 6.11.3 to 6.11.4 by @dependabot in https://github.com/verida/vault-mobile/pull/1032

# 0.4.2 (2023-08-29)

## Bug Fixes

- Fixed issues with Polygon ID identities created in the previous beta version of the Polygon ID SDK by @aurelticot in https://github.com/verida/vault-mobile/pull/1046

# 0.4.1 (2023-08-25)

## Bug Fixes

- Fix/1016 - Handle potential null message in Polygon ID `parseMessage` by @aurelticot in https://github.com/verida/vault-mobile/pull/1028
- Fix/1029 - Fix linting issues by @aurelticot in https://github.com/verida/vault-mobile/pull/1030
- Fix/1021 - Undefined private key used in Polygon ID config by @aurelticot in https://github.com/verida/vault-mobile/pull/1027

## Misc

- Upgrade Polygon ID dependencies and refactor the web app by @aurelticot in https://github.com/verida/vault-mobile/pull/1034
- Implement custom logger + improve Sentry reporting in Polygon ID by @aurelticot in https://github.com/verida/vault-mobile/pull/1014
- Feature/1020 - Skip fetching public profile of non-Verida DIDs by @aurelticot in https://github.com/verida/vault-mobile/pull/1026
- Bump word-wrap from 1.2.3 to 1.2.4 in /web by @dependabot in https://github.com/verida/vault-mobile/pull/1002
- Bump word-wrap from 1.2.3 to 1.2.4 by @dependabot in https://github.com/verida/vault-mobile/pull/1001

# 0.4.0 (2023-07-28)

## Breaking Changes

- Algorand support has been disabled

## Enhancements

- Upgrade WalletConnect to v2 by @cawfree in https://github.com/verida/vault-mobile/pull/935

* Add support for Polygon ID deep links by @andy-verida in https://github.com/verida/vault-mobile/pull/996

- Optimise performances by caching information by @andy-verida in https://github.com/verida/vault-mobile/pull/980

## Misc

- Refactor redux, now fully typed by @andy-verida in https://github.com/verida/vault-mobile/pull/980

# 0.3.51 (2023-07-14)

## Enhancements

- Update content of the DIDNonExistentModal modal by @andy-verida in https://github.com/verida/vault-mobile/pull/989
- Use iden3 protocol info to better identify Polygon ID QR codes by @aurelticot in https://github.com/verida/vault-mobile/pull/991

## Bug fixes

- Fix App crashes when logging out of selected identity by @andy-verida in https://github.com/verida/vault-mobile/pull/966

## Misc

- Fix CI by @cawfree in https://github.com/verida/vault-mobile/pull/932
- Migrate CI to GitHub Actions by @aurelticot in https://github.com/verida/vault-mobile/pull/992

# 0.3.50 (2023-07-02)

## What's Changed

- Fix RPC node by @aurelticot in https://github.com/verida/vault-mobile/pull/970

# 0.3.49 (2023-06-29)

- Optimize performance by @andy-verida in https://github.com/verida/vault-mobile/pull/936
- Fix various bugs by @andy-verida in https://github.com/verida/vault-mobile/pull/927

# 0.3.48 (2023-06-22)

- Feature/933 Enable Polygon ID mainnet instead of testnet by @aurelticot in https://github.com/verida/vault-mobile/pull/934

# 0.3.47 (2023-05-26)

- Feature - Android + Polygon ID improvements by @aurelticot in https://github.com/verida/vault-mobile/pull/910
- Fix duplicate word issue when verifying seed phrase by @tahpot in https://github.com/verida/vault-mobile/pull/916
- Feature/818 profile social media links by @andy-verida in https://github.com/verida/vault-mobile/pull/918
- Fix WalletConnect issue by @andy-verida in https://github.com/verida/vault-mobile/pull/922

# 0.3.46 (2023-05-15)

- Feature/887 Enable Polygon ID on Android by @aurelticot in https://github.com/verida/vault-mobile/pull/899
- Fix crashes and errors by @andy-verida in https://github.com/verida/vault-mobile/pull/897
- Update to protocol v2.3.5 by @tahpot in https://github.com/verida/vault-mobile/pull/905
- Import private key along with mnemonic when importing a Verida account. by @tahpot in https://github.com/verida/vault-mobile/pull/903
- Feature/821 Improve UI of Import Identity button by @aurelticot in https://github.com/verida/vault-mobile/pull/907

# 0.3.45 (2023-05-08)

- Feature/859 Implement UI required for Polygon ID by @aurelticot in https://github.com/verida/vault-mobile/pull/860
- Feature/828 Add Polygon ID support by @tahpot in https://github.com/verida/vault-mobile/pull/858
- Feature/852 migrate wallet provider api by @tahpot in https://github.com/verida/vault-mobile/pull/884

# 2023-04-28

- Update app icon by @andy-verida in https://github.com/verida/vault-mobile/pull/857
- Feature/853 Support watched wallet by @aurelticot in https://github.com/verida/vault-mobile/pull/854
- Feature/863 Allow fallback action in data requests by @aurelticot in https://github.com/verida/vault-mobile/pull/864
- Feature/866 Integrate Veramo SDK for Verifiable Credential support by @aurelticot in https://github.com/verida/vault-mobile/pull/867
- Feature/847 claiming username by @andy-verida in https://github.com/verida/vault-mobile/pull/856
- Feature/506 Support Verida Usernames by @tahpot in https://github.com/verida/vault-mobile/pull/833
- Bump vm2 from 3.9.16 to 3.9.17 by @dependabot in https://github.com/verida/vault-mobile/pull/876
- Feature/870 handle non existent dids by @andy-verida in https://github.com/verida/vault-mobile/pull/875
- Feature/877 upgrade to protocol 2.3.0 by @tahpot in https://github.com/verida/vault-mobile/pull/881

# 2023-03-14

- Upgrade protocol to v2.2.0 by @tahpot in https://github.com/verida/vault-mobile/pull/842
- Feature/765 wallet selector component UI by @cmcWebCode40 in https://github.com/verida/vault-mobile/pull/778
- NFT collectibles tab by @andy-verida in https://github.com/verida/vault-mobile/pull/787
- Feature/update app logo by @andy-verida in https://github.com/verida/vault-mobile/pull/834
- Feature/817 one profile links by @andy-verida in https://github.com/verida/vault-mobile/pull/829
- Feature/819 profile featured assets by @andy-verida in https://github.com/verida/vault-mobile/pull/831
- Release/2023 03 01 by @andy-verida in https://github.com/verida/vault-mobile/pull/832

# 2023-02-16

- VeridaOneManager by @tahpot in https://github.com/verida/vault-mobile/pull/802
- Feature/737 handle async did creation by @andy-verida in https://github.com/verida/vault-mobile/pull/804
- Feature/update profile screen by @andy-verida in https://github.com/verida/vault-mobile/pull/803
- Improve app loading speed. Fix account creation issues. by @tahpot in https://github.com/verida/vault-mobile/pull/794
- Implement Verida Secure store to solve this issue https://github.com/… by @andy-verida in https://github.com/verida/vault-mobile/pull/808
- fix/809-update-vcs by @tahpot in https://github.com/verida/vault-mobile/pull/810
- Fix/upgrade protocol replication fixes by @tahpot in https://github.com/verida/vault-mobile/pull/811
- Release 2023 Feb 10 by @andy-verida in https://github.com/verida/vault-mobile/pull/807
- Upgrade protocol to v2.1.2 by @tahpot in https://github.com/verida/vault-mobile/pull/814

# 2023-01-20

- Feature/520 update storage node auth by @tahpot in https://github.com/verida/vault-mobile/pull/741
- fix:remove redundant api by @cmcWebCode40 in https://github.com/verida/vault-mobile/pull/756
- Change Walletprovider api url by @cmcWebCode40 in https://github.com/verida/vault-mobile/pull/757
- fix:Added an error message when character limit has exceeded by @cmcWebCode40 in https://github.com/verida/vault-mobile/pull/758
- Replace `tokens/get` with `/tokens/getWithPrice` API by @andy-verida in https://github.com/verida/vault-mobile/pull/759
- fix:modified images reference from http to https by @cmcWebCode40 in https://github.com/verida/vault-mobile/pull/751
- redirect user to the Home Screen by @cmcWebCode40 in https://github.com/verida/vault-mobile/pull/762
- Forced upgrade application using Firebase Remote config by @andy-verida in https://github.com/verida/vault-mobile/pull/779
- Feature/UI components styles refactor by @andy-verida in https://github.com/verida/vault-mobile/pull/783
- Fix WalletConnect stale state issue, Eth_sendTransaction to allow optional params, and Eth_sign standard doesn't work. by @andy-verida in https://github.com/verida/vault-mobile/pull/781
- Bump decode-uri-component from 0.2.0 to 0.2.2 by @dependabot in https://github.com/verida/vault-mobile/pull/784
- Acacia Release: Andy tasks by @andy-verida in https://github.com/verida/vault-mobile/pull/789
- Release/2.0 acacia by @tahpot in https://github.com/verida/vault-mobile/pull/788

# internal_0.3.37 (2023-01-15)

- Upgrade Vault to use decentralized Acacia testnet
- Full Changelog https://github.com/verida/vault-mobile/releases

# 2021-03-23

- Initial internal alpha release
