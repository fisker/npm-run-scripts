import filesize from 'rollup-plugin-filesize'
import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import {dependencies} from './package.json'

export default {
  input: './src/cli.js',
  output: {
    file: './bin/cli',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
  plugins: [commonjs(), json(), filesize()],
  externals: [...Object.keys(dependencies), './package.json'],
}
