module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
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
      ['@babel/plugin-transform-private-methods', { loose: false }],
    ],
  }
}
