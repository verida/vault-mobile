const reactnative = require('react-native')

/**
 * TODO: delete me.
 * Some old library versions still use ViewPropTypes, ex: native-base
 * We need some effort to remove or upgrade those libraries
 */

Object.defineProperty(reactnative, 'ColorPropType', {
  configurable: true,
  get() {
    return {}
  },
})

Object.defineProperty(reactnative, 'EdgeInsetsPropType', {
  configurable: true,
  get() {
    return {}
  },
})

Object.defineProperty(reactnative, 'PointPropType', {
  configurable: true,
  get() {
    return {}
  },
})

Object.defineProperty(reactnative, 'ViewPropTypes', {
  configurable: true,
  get() {
    return {}
  },
})
