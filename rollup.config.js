const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const { camelCase } = require('change-case');
const createBanner = require('create-banner');
const pkg = require('./package');

const name = camelCase(pkg.name.replace('js', ''));
const banner = createBanner({
  data: {
    name: `${name}.js`,
    year: '2019-present',
  },
});

module.exports = {
  input: 'src/index.js',
  output: [
    {
      banner,
      name,
      file: `dist/${name}.js`,
      format: 'umd',
    },
    {
      banner,
      file: `dist/${name}.common.js`,
      format: 'cjs',
    },
    {
      banner,
      file: `dist/${name}.esm.js`,
      format: 'esm',
    },
  ],
  watch: {
    exclude: 'node_modules/**'
  },
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**'
    }),
  ]
};