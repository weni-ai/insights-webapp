module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: ['@weni/eslint-config/vue3'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
};
