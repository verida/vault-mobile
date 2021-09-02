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
          },
        },
      ],
    ],
  }
}
