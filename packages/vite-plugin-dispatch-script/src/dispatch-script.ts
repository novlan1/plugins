import path from 'node:path';

import type { Plugin } from 'vite';

import {
  hasJsonFile,
} from '@dcloudio/uni-cli-shared';

import { isInBlackList } from '@plugin-light/shared';
import { randomString, saveJsonToLogMore } from 't-comm';

import {
  checkSubPackage,
  circularSet,
  findImporters,
  getPagesJson,
  staticImportedByEntry,
} from './core-analyze';
import {
  ANALYZE_BLACK_LIST,
  CHUNK_FILE_NAME_BLACK_LIST,
  DEFAULT_ASSETS_RE,
  EXTNAME_JS_RE,
  isCSSRequest,
  isVueJs,
  MAIN,
  normalizePath,
  PAGES_JSON_JS,
  removeExt,
} from './helper';


import { checkImportError } from './warn';

import type { IDispatchScriptOptions, IterativeMap } from './types';
import type { GetManualChunk } from 'rollup';


let logged = false;

const allJson: Record<string, {
  importers: string[],
  subPackages: string[]
}> = {};

const iterativeMap: IterativeMap = {};

const dispatchedScriptMap: Record<string, {
  subPackage: string;
  targetName: string;
}> = {};


export function dispatchScriptVitePlugin(options?: IDispatchScriptOptions): Plugin {
  return {
    name: 'vite-plugin-dispatch-script',
    enforce: 'post',
    async config() {
      const inputDir = normalizePath(process.env.UNI_INPUT_DIR || '');
      const dispatchDir = options?.dispatchDir ?? `dispatch-script-${randomString(8)}`;
      const blackList = options?.blackList;
      const whiteList = options?.whiteList;
      const vendorName = options?.vendorName ?? 'vendor-1';

      const {
        mainPages,
        subPackagesMap,
      } = getPagesJson(inputDir, options);

      return {
        build: {
          rollupOptions: {
            output: {
              manualChunks: (createMoveToVendorChunkFn({
                mainPages,
                subPackagesMap,
                dispatchDir,
                blackList,
                whiteList,
                vendorName,
              }) as any),
            },
          },
        },
      };
    },
    writeBundle() {
      if (logged) return;
      logged = true;
      saveJsonToLogMore(iterativeMap, './vite-dispatch-script-json-1-iterative.json', {
        max: options?.maxLogNumber,
      });
      saveJsonToLogMore(allJson, './vite-dispatch-script-json-2-flatten.json', {
        max: options?.maxLogNumber,
      });
      saveJsonToLogMore(dispatchedScriptMap, './vite-dispatch-script-json-3-dispatched.json', {
        max: options?.maxLogNumber,
      });


      const inputDir = normalizePath(process.env.UNI_INPUT_DIR || '');

      const {
        mainPages,
        subPackagesMap,
      } = getPagesJson(inputDir, options);


      const errorFiles = checkImportError({
        inputDir,
        mainPages,
        subPackagesMap,
        iterativeMap,
      });

      saveJsonToLogMore({
        errorFiles,
        circular: Array.from(circularSet),
      }, './vite-dispatch-script-error-importation-files.json', {
        max: options?.maxLogNumber,
      });
    },
  };
}


function createMoveToVendorChunkFn({
  mainPages,
  subPackagesMap,
  dispatchDir,
  blackList,
  whiteList,
  vendorName,
}: {
  mainPages: string[];
  subPackagesMap: Record<string, string>;
  dispatchDir: string;
  blackList?: IDispatchScriptOptions['blackList'];
  whiteList?: IDispatchScriptOptions['whiteList'];
  vendorName?: IDispatchScriptOptions['vendorName'];
}): GetManualChunk {
  const cache = new Map<string, boolean>();

  const inputDir = normalizePath(process.env.UNI_INPUT_DIR || '');
  const iVendorName = vendorName ?? 'vendor-1';

  console.log('>>> dispatch script inputDir: ', inputDir);

  return (id, { getModuleInfo, getModuleIds }) => {
    const normalizedId = normalizePath(id);
    const filename = normalizedId.split('?')[0];

    let subPackages: string[] = [];


    if (!ANALYZE_BLACK_LIST.find(item => id.includes(item)) && !id.endsWith(PAGES_JSON_JS)) {
      const res = findImporters({
        id,
        importChain: [],
        getModuleInfo,
        getModuleIds,
        pre: [],
        inputDir,
        iterativeMap,
      });
      subPackages = checkSubPackage({
        inputDir,
        mainPages,
        subPackagesMap,
        deps: res,
      });

      allJson[id] = {
        importers: res,
        subPackages,
      };
    }


    // 处理资源文件
    if (DEFAULT_ASSETS_RE.test(filename)) {
      return 'common/assets';
    }


    // 处理项目内的js,ts文件
    if (EXTNAME_JS_RE.test(filename)) {
      if (filename.startsWith(inputDir) && !filename.includes('node_modules')) {
        const chunkFileName = removeExt(normalizePath(path.relative(inputDir, filename)));
        if (
          CHUNK_FILE_NAME_BLACK_LIST.includes(chunkFileName)
          || hasJsonFile(chunkFileName) // 无同名的page,component
        ) {
          console.log('>>> dispatch script chunkFileName: ', chunkFileName);
          // return chunkFileName;
          return;
        }
        console.log('>>> dispatch script defaultPath: ', id);
        // return;
      }


      if (!subPackages.includes(MAIN)
        && !isInBlackList(id, blackList)
        && !id.includes('?commonjs-module')
        && (subPackages.length === 1 || isInBlackList(id, whiteList)
        )
      ) {
        const dispatchChunkFileName = id.includes('node_modules/')
          ? removeExt(filename.replace(/^.*node_modules\//, ''))
            .replace(/\//g, '_')
          : removeExt(normalizePath(path.relative(path.resolve(inputDir), filename)))
            .replace(/\.\.\//g, '_')
            .replace(/\//g, '_');

        const targetName = `${subPackages[0]}/${dispatchDir}/${dispatchChunkFileName}`;

        dispatchedScriptMap[id] = {
          subPackage: subPackages[0],
          targetName,
        };

        return targetName;
      }

      console.log('>>> dispatch script commonVendor: ', id);

      // 非项目内的 js 资源，均打包到 vendor
      return `common/${iVendorName}`;
    }

    if (
      isVueJs(normalizedId)
      || (normalizedId.includes('node_modules')
        && !isCSSRequest(normalizedId)
        // 使用原始路径，格式化的可能找不到模块信息 https://github.com/dcloudio/uni-app/issues/3425
        && staticImportedByEntry(id, getModuleInfo, cache))
    ) {
      return `common/${iVendorName}`;
    }
  };
}


