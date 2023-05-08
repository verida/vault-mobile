const webpack = require("webpack");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};

  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    stream: require.resolve("stream-browserify"),
    util: require.resolve("util"),
    url: require.resolve("url"),
    path: require.resolve("path-browserify"),
    os: require.resolve("os-browserify"),
    constants: require.resolve("constants-browserify"),
    assert: require.resolve("assert"),
    "process/browser": require.resolve("process/browser"),
    buffer: require.resolve("buffer/"),
    fs: require.resolve("browserify-fs"),
    readline: require.resolve("readline-browserify"),
  });
  config.resolve.fallback = fallback;

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  config.module.rules = config.module.rules.map((rule) => {
    if (rule.oneOf instanceof Array) {
      rule.oneOf[rule.oneOf.length - 1].exclude = [
        /\.(js|mjs|jsx|cjs|ts|tsx)$/,
        /\.html$/,
        /\.json$/,
      ];
    }
    return rule;
  });

  // Ignore some warnings
  config.ignoreWarnings = [
    /Failed to parse source map/, // until fixed by cra https://github.com/facebook/create-react-app/pull/11752
  ];

  return config;
};
