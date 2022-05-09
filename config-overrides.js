const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {}
  Object.assign(fallback, {
    net: false,
    fs: false,
    tls: false,
    process: false,
  })
  config.resolve.fallback = fallback

  config.plugins = (config.plugins || []).concat([
    new NodePolyfillPlugin({ excludeAliases: ['console'] }),
  ])

  return config
}
