import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import { getDeps } from 't-comm';


const BUNDLE_DIR = 'lib';


export function getRollupConfig(inputDir, externals = [], options) {
  const dir = inputDir ? inputDir : dirname(fileURLToPath(options.fileUrl));

  const entry = options?.entry ?? './src/index.ts';
  const DEFAULT_PLUGINS = [
    resolve(),
    commonjs(),
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

  const rollUpConfigList = [
    {
      input: path.resolve(dir, entry),
      output: {
        dir: BUNDLE_DIR,
        format: 'cjs',
        entryFileNames: 'index.js',
      },
      external: [
        ...EXTERNALS,
      ],
      plugins: [
        json(),
        ...DEFAULT_PLUGINS,
      ],
    },
  ];


  return rollUpConfigList;
}
