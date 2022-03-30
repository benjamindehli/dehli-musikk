const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.plugins.forEach((plugin, i) => {
    if (plugin instanceof MiniCssExtractPlugin) {
      config.plugins.splice(i, 1, new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      //  ignoreOrder: true, // Enable to remove warnings about conflicting order
      }));
    }
  });
  const oneOfRules = config.module.rules[1].oneOf.map(rule => {
    if (Array.isArray(rule.test) && rule.test[0].toString() === '/\\.avif$/') { // Disable base64 on small .avif images
      rule.type = 'asset/resource'
    } else if (Array.isArray(rule.test) && rule.test[0].toString() === '/\\.bmp$/') { // Disable base64 on small other images
      rule.type = 'asset/resource'
    }
    return rule;
  });
  config.module.rules[1].oneOf = oneOfRules;
  return config;
}
