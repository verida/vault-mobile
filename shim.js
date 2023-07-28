import { decode, encode } from 'base-64'
import { EventEmitter } from 'events'

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

/**
 *
 * We had to include the following polyfill to support decoding NEAR private keys into KeyPairs using:
 * import { utils } from 'near-api-js'
 * utils.KeyPair.fromString(privateKey)
 *
 * Source: https://github.com/WalletConnect/walletconnect-monorepo/issues/1338#issuecomment-1210995006
 *
 * TextEncoder/TextDecoder polyfills for utf-8 - an implementation of TextEncoder/TextDecoder APIs
 * Written in 2013 by Viktor Mukhachev <vic99999@yandex.ru>
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.                                                     Below:
 *
 * Some important notes about the polyfill below:
 * Native TextEncoder/TextDecoder implementation is overwritten
 * String.prototype.codePointAt polyfill not included, as well as String.fromCodePoint
 * TextEncoder.prototype.encode returns a regular array instead of Uint8Array
 * No options (fatal of the TextDecoder constructor and stream of the TextDecoder.prototype.decode method) are supported.
 * TextDecoder.prototype.decode does not valid byte sequences
 * This is a demonstrative implementation not intended to have the best performance
 *
 * http://encoding.spec.whatwg.org/#textencoder
 */

function TextEncoder() {}

TextEncoder.prototype.encode = function (val) {
  const octets = []
  const { length } = val
  let i = 0
  while (i < length) {
    const codePoint = val.codePointAt(i)

    if (!codePoint) return 1

    let c = 0
    let bits = 0
    if (codePoint <= 0x0000007f) {
      c = 0
      bits = 0x00
    } else if (codePoint <= 0x000007ff) {
      c = 6
      bits = 0xc0
    } else if (codePoint <= 0x0000ffff) {
      c = 12
      bits = 0xe0
    } else if (codePoint <= 0x001fffff) {
      c = 18
      bits = 0xf0
    }
    octets.push(bits | (codePoint >> c))
    c -= 6
    while (c >= 0) {
      octets.push(0x80 | ((codePoint >> c) & 0x3f))
      c -= 6
    }
    i += codePoint >= 0x10000 ? 2 : 1
  }
  return octets
}

global.TextEncoder = TextEncoder

function TextDecoder() {}

TextDecoder.prototype.decode = function (octets) {
  let string = ''
  let i = 0
  while (i < octets.length) {
    let octet = octets[i]
    let bytesNeeded = 0
    let codePoint = 0
    if (octet <= 0x7f) {
      bytesNeeded = 0
      codePoint = octet & 0xff
    } else if (octet <= 0xdf) {
      bytesNeeded = 1
      codePoint = octet & 0x1f
    } else if (octet <= 0xef) {
      bytesNeeded = 2
      codePoint = octet & 0x0f
    } else if (octet <= 0xf4) {
      bytesNeeded = 3
      codePoint = octet & 0x07
    }
    if (octets.length - i - bytesNeeded > 0) {
      let k = 0
      while (k < bytesNeeded) {
        octet = octets[i + k + 1]
        codePoint = (codePoint << 6) | (octet & 0x3f)
        k += 1
      }
    } else {
      codePoint = 0xfffd
      bytesNeeded = octets.length - i
    }
    string += String.fromCodePoint(codePoint)
    i += bytesNeeded + 1
  }
  return string
}

global.TextDecoder = TextDecoder

if (typeof BigInt === 'undefined') global.BigInt = require('big-integer')
