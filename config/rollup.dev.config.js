import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  input: './src/reactive.js',
  external: [],
  output: {
    file: './dist/reactive.js',
    name: 'reactivejs',
    format: 'umd',
    paths: {
      // jquery: 'jquery',
      // jointjs: 'joint',
    }
  },
  plugins: [
    resolve(),
    babel({
      babelrc: false,
      presets: [['env', { modules: false }]],
      "plugins": [
        // "external-helpers"
      ],
      include: 'src/**'
    })
  ]
};