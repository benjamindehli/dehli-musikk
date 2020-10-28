module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.module.rules[1].oneOf[0].options.limit = 0; // Disable base64 on small images
  return config;
}
