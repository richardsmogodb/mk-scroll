module.exports = {
  root: true,
  env: {
    "browser": true,
    "es6": true
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "prettier"
  ],
  globals: {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  parserOptions: {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  rules: {
    "prettier/prettier": "error"
  }
};