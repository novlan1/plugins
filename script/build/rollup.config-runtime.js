// import fs from 'node:fs';
import path from 'node:path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

// import babel from '@rollup/plugin-babel';
import { getDeps } from 't-comm';
import { terser } from 'rollup-plugin-terser';


const BUNDLE_DIR = 'lib';


export function getRollupConfig(dir, externals = [], options) {
  const entry = options?.entry ?? './src/index.ts';
  // if (fs.existsSync(path.resolve(dir, '.babelrc'))) {
  //   fs.unlinkSync(path.resolve(dir, '.babelrc'));
  // }
  const DEFAULT_PLUGINS = [
    resolve(),
    commonjs(),
    // babel({
    //   // babelHelpers: 'runtime',
    //   // // 只转换源代码，不运行外部依赖
    //   // exclude: '**/node_modules/**',
    //   // // babel 默认不支持 ts 需要手动添加
    //   // extensions: [...DEFAULT_EXTENSIONS, '.ts'],
    // }),
    typescript({
      sourceMap: false,
      tsconfig: path.resolve(dir, './tsconfig.json'),
    }),
  ];

  const EXTERNALS =  [
    ...getDeps(dir),
    '@babel/traverse',
    '@babel/generator',
    '@babel/parser',
    '@babel/types',
    'vite',
    'webpack',
    ...externals,
  ];

  const oneConfig =  {
    input: path.resolve(dir, entry),
    output: {
      dir: BUNDLE_DIR,
      format: 'umd',
      name: options.umdName,
      entryFileNames: 'index.js',
    },
    external: [
      ...EXTERNALS,
    ],
    plugins: [
      json(),
      ...DEFAULT_PLUGINS,
    ],
  };

  const rollUpConfigList = [
    oneConfig,

    {
      ...oneConfig,
      output: {
        dir: BUNDLE_DIR,
        format: 'umd',
        name: options.umdName,
        entryFileNames: 'index.prod.js',
      },
      plugins: [
        json(),
        terser(),
        ...DEFAULT_PLUGINS,
      ],
    },

    ...((options.extraESBuild || []).map(config => ({
      ...oneConfig,
      input: path.resolve(dir, config.entry),
      output: {
        dir: BUNDLE_DIR,
        format: 'es',
        entryFileNames: config.target,
      },

      plugins: [
        json(),
        terser(),
        ...DEFAULT_PLUGINS,
      ],
    }))),
  ];


  return rollUpConfigList;
}
