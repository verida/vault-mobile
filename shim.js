import { decode, encode } from 'base-64'
import { EventEmitter } from 'events'
import * as RNWebAssembly from 'react-native-webassembly';

const { BigNumber } = require('ethers')

if (typeof __dirname === 'undefined') global.__dirname = '/'
if (typeof __filename === 'undefined') global.__filename = ''
if (typeof process === 'undefined') {
  global.process = require('process')
} else {
  const bProcess = require('process')
  for (var p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p]
    }
  }
}

process.browser = true
if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

//const w = require('Worker')
//console.log(w)

// global.location = global.location || { port: 80 }
const isDev = typeof __DEV__ === 'boolean' && __DEV__
process.env.NODE_ENV = isDev ? 'development' : 'production'
if (typeof localStorage !== 'undefined') {
  localStorage.debug = isDev ? '*' : ''
}

// If using the crypto shim, uncomment the following line to ensure
// crypto is loaded first, so it can populate global.crypto
// const crypto = require('crypto')
// if (typeof global.crypto.subtle !== 'object') {
//   global.crypto.subtle = {
//     digest: () => Promise,
//   }
// }

EventEmitter.defaultMaxListeners = 32

if (!global.btoa) {
  global.btoa = encode
}

if (!global.atob) {
  global.atob = decode
}

global.navigator = {
  userAgent: 'mobile',
}

// TODO: Investigate - the Android Lottie animation view has an issue with the `JSON.sortify` module(it sorts object keys alphabetically.)
// So we keep an original reference to the JS JSON functions and patch usages in the Lottie-react-native package
// to make the animation on Android work again
global.originalJSON = {
  stringify: JSON.stringify,
  parse: JSON.parse,
}

function bigIntPow() {
  return BigNumber.from(arguments[0])
    .pow(BigNumber.from(arguments[1]))
    .toBigInt()
}

function makePow(pow) {
  return function () {
    if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
      return pow.apply(this, arguments)
    }
    return bigIntPow.apply(this, arguments)
  }
}

Math.pow = makePow(Math.pow)

global.WebAssembly = RNWebAssembly;

(async () => {
  const buffer = Uint8Array.from([
    0x00,0x61,0x73,0x6D,0x01,0x00,0x00,0x00
   ,0x01,0x87,0x80,0x80,0x80,0x00,0x01,0x60
   ,0x02,0x7F,0x7F,0x01,0x7F,0x03,0x82,0x80
   ,0x80,0x80,0x00,0x01,0x00,0x07,0x87,0x80
   ,0x80,0x80,0x00,0x01,0x03,0x61,0x64,0x64
   ,0x00,0x00,0x0A,0x8D,0x80,0x80,0x80,0x00
   ,0x01,0x87,0x80,0x80,0x80,0x00,0x00,0x20
   ,0x00,0x20,0x01,0x6A,0x0B]);


  const x = await WebAssembly.instantiate(buffer);
  console.log('===> Call Webabsembly add(1, 2): ', x.instance.exports.add(1, 2))
})();

