#! /usr/bin/env node
var fs = require('fs')

function fixVaultCommon() {
  const path = 'node_modules/@verida/vault-common/package.json'
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    var result = data.replace(/dist\/vault.js/g, 'src/vault.ts')

    fs.writeFile(path, result, 'utf8', function (err) {
      if (err) return console.log(err)
      console.log('Fixed: vault-common')
    })
  })
}

function fixDuplicatedSocket() {
  const path1 =
    'node_modules/react-native-tcp/ios/CocoaAsyncSocket/GCDAsyncSocket.m'
  const path2 =
    'node_modules/react-native-udp/ios/CocoaAsyncSocket/GCDAsyncUdpSocket.m'
  if (fs.existsSync(path1)) {
    fs.unlinkSync(path1)
    console.log(`Removed duplicated file from ${path1}`)
  }
  if (fs.existsSync(path2)) {
    fs.unlinkSync(path2)
    console.log(`Removed duplicated file from ${path2}`)
  }
}

fixVaultCommon()
fixDuplicatedSocket()
