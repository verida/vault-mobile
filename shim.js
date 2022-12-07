import { decode, encode } from 'base-64'
import { EventEmitter } from 'events'

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

//[TypeError: fetchFun is not a function. (In 'fetchFun(url, options)', 'fetchFun' is false)]
// The above error could occur when running on an ios simulator which will prevent the native fetch function to work.
global.fetch
