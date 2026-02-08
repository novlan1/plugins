
import fs from 'node:fs';
import path from 'node:path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

// import babel from '@rollup/plugin-babel';
import { getDeps, readFileSync, writeFileSync } from 't-comm';
import { terser } from 'rollup-plugin-terser';

const BUNDLE_DIR = 'lib';


export function getLoaderRollupConfig(dir) {
  const loaderFile = path.resolve(dir, './src/loader.ts');
  if (!fs.existsSync(loaderFile)) {
    writeFileSync(loaderFile, readFileSync(path.resolve(dir, './src/index.ts')));
  }

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
    'loader-utils',
    '@babel/traverse',
    '@babel/generator',
    '@babel/parser',
    '@babel/types',
    'dom-serializer',
  ];

  const rollUpConfigList = [
    {
      input: path.resolve(dir, './src/index.ts'),
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
    {
      input: path.resolve(dir, './src/loader.ts'),
      output: {
        dir: BUNDLE_DIR,
        format: 'cjs',
        entryFileNames: 'loader.js',
        exports: 'default',
      },
      external: [
        ...EXTERNALS,
      ],
      plugins: [
        json(),
        ...DEFAULT_PLUGINS,
      ],
    },
    {
      input: path.resolve(dir, './src/loader.ts'),
      output: {
        dir: BUNDLE_DIR,
        format: 'cjs',
        entryFileNames: 'loader.prod.js',
        exports: 'default',
      },
      external: [
        ...EXTERNALS,
      ],
      plugins: [
        json(),
        terser(),
        ...DEFAULT_PLUGINS,
      ],
    },
  ];
  return rollUpConfigList;
}
