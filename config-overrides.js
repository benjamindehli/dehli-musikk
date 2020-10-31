const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.plugins.forEach((plugin, i) => {
    if (plugin instanceof MiniCssExtractPlugin) {
      config.plugins.splice(i, 1, new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        ignoreOrder: true, // Enable to remove warnings about conflicting order
      }));
    }
  });
  config.module.rules[1].oneOf[0].options.limit = 0; // Disable base64 on small images
  return config;
}
