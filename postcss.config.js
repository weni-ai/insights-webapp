const postcssPresetEnv = require('postcss-preset-env');
const postcssPrefixwrap = require('postcss-prefixwrap');

module.exports = {
  plugins: [
    // Plugin to support modern CSS features
    postcssPresetEnv({
      stage: 2,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'color-function': true,
      },
    }),

    // Plugin to prefix all CSS classes with the module name
    postcssPrefixwrap('.insights-webapp', {
      prefixRootTags: true,
      // :root must stay unprefixed so Unnnic custom properties apply.
      // prefixRootTags would otherwise turn :root into ".insights-webapp .:root".
      ignoredSelectors: [':root'],
    }),
  ],
};
