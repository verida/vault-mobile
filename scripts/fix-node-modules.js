#! /usr/bin/env node
var fs = require('fs')
const childProcess = require('child_process')

function fixVaultCommon() {
  childProcess.spawn('tsc', [], {
    stdio: 'inherit',
    cwd: 'node_modules/@verida/vault-common',
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
