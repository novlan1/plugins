const { getESLintImportOrderRule } = require('t-comm');


module.exports = {
  root: true,
  extends: ['eslint-config-light'],
  rules: {
    ...getESLintImportOrderRule(),
  },
};
