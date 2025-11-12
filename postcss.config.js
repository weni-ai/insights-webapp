import postcssPresetEnv from 'postcss-preset-env';
import postcssPrefixwrap from 'postcss-prefixwrap';

export default {
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
    }),
  ],
};
