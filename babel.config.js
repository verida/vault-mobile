module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '~': ['./src'],
            api: ['./src/api'],
            assets: ['./src/assets'],
            components: ['./src/components'],
            config: ['./src/config'],
            constants: ['./src/constants'],
            helpers: ['./src/helpers'],
            pages: ['./src/pages'],
            routes: ['./src/routes'],
            reduxStore: ['./src/reduxStore'],
            styles: ['./src/styles'],
            hooks: ['./src/hooks'],
            utils: ['./src/utils'],
            stream: 'stream-browserify',
            crypto: 'react-native-quick-crypto',
            'react-native-crypto': 'react-native-quick-crypto',
            buffer: '@craftzdog/react-native-buffer',
            '@ethersproject/pbkdf2': 'pbkdf2',
          },
        },
      ],
      'react-native-reanimated/plugin',
      '@babel/plugin-syntax-import-assertions',
      '@babel/plugin-proposal-numeric-separator',
      '@babel/plugin-proposal-logical-assignment-operators',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
    overrides: [
      {
        test: './node_modules/@0xpolygonid/js-sdk/node_modules/ethers',
        plugins: [
          '@babel/plugin-proposal-private-property-in-object',
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-proposal-private-methods',
        ],
      },
    ],
  }
}
