module.exports = function override(config, env) {
  //do stuff with the webpack config...
  if (env === 'production'){
    config.plugins['MiniCssExtractPlugin'] = {
      filename: '[name].css',
      chunkFilename: '[id].css',
      ignoreOrder: true, // Enable to remove warnings about conflicting order
    }
  }
  config.module.rules[1].oneOf[0].options.limit = 0; // Disable base64 on small images
  return config;
}
