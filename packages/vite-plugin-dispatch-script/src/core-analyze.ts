import path from 'node:path';

import {
  isMiniProgramPageFile,
  parseJson,
} from '@dcloudio/uni-cli-shared';

import { readFileSync, saveJsonToLogMore } from 't-comm';


import {
  APP_VUE,
  ENTRY,
  isUniComponentUrl,
  isUniPageUrl,
  MAIN,
  normalizePath,
  parseVirtualComponentPath,
  parseVirtualPagePath,
  virtualComponentPath,
} from './helper';

import type {
  IDispatchScriptOptions,
  IterativeMap,
  PagesJson,
} from './types';
import type { GetModuleInfo } from 'rollup';


const importerCache = new Map<string, string[]>();
export const circularSet = new Set<string>();


export function findImporters({
  id,
  importChain,
  getModuleInfo,
  getModuleIds,
  pre = [],
  inputDir = '',
  iterativeMap = {},
}: {
  id: string;
  pre: Array<string>;
  inputDir: string;
  getModuleIds: Function;
  getModuleInfo: Function;
  importChain: Array<string>;
  iterativeMap: IterativeMap;
}) {
  let parsedId = id;
  if (isUniPageUrl(parsedId)) {
    parsedId = normalizePath(path.resolve(inputDir, parseVirtualPagePath(parsedId)));
  }
  if (isUniComponentUrl(parsedId)) {
    parsedId = normalizePath(path.resolve(inputDir, parseVirtualComponentPath(parsedId)));
  }

  // 虚拟页面的引用者一定为空
  if (parsedId.endsWith('.vue') && isMiniProgramPageFile(parsedId,  process.env.UNI_INPUT_DIR)) {
    return [];
  }

  // 非虚拟组件的引用者只有虚拟组件，没必要分析
  if (parsedId === id && id.endsWith('.vue')) {
    return [];
  }

  const moduleInfo = getModuleInfo(id);

  iterativeMap[parsedId] = {
    parsedId: parsedId !== id ? parsedId : undefined,
    dynamic: moduleInfo?.dynamicImporters || [],
    importers: moduleInfo?.importers || [],
  };


  // pre 只存真正的组件/脚本
  if (pre.includes(parsedId)) {
    const res =  [...importChain,
      // 出现循环依赖，就假装它被 main.ts 依赖，自然不会被处理
      path.resolve(inputDir, ENTRY),
    ];

    circularSet.add(parsedId);
    importerCache.set(parsedId, res);
    return res;
  }


  if (importerCache.has(parsedId)) {
    return importerCache.get(parsedId) || [];
  }


  const allImporters = [
    ...(moduleInfo?.importers || []),
    ...(moduleInfo?.dynamicImporters || []),
  ];


  for (const importer of allImporters) {
    let parsedImporter = importer;
    let virtualImporter = importer;

    if (isUniPageUrl(importer)) {
      parsedImporter = normalizePath(path.resolve(inputDir, parseVirtualPagePath(importer)));
    } else if (isUniComponentUrl(importer)) {
      parsedImporter = normalizePath(path.resolve(inputDir, parseVirtualComponentPath(importer)));
    } else if (importer.endsWith('.vue') && !isMiniProgramPageFile(importer, process.env.UNI_INPUT_DIR)) {
      virtualImporter = virtualComponentPath(importer);
    }

    if (parsedImporter === id && !virtualImporter) {
      continue;
    }
    if (parsedImporter.endsWith('/pages-json-js')) {
      continue;
    }
    let virtual: string[] = [];

    let chain: string[] = [];

    if (virtualImporter && virtualImporter !== importer && !isUniPageUrl(virtualImporter)) {
      // 直接找虚拟组件的引用者
      virtual = findImporters({
        id: virtualImporter,
        importChain: [],
        getModuleInfo,
        getModuleIds,
        pre: pre.concat(id),
        inputDir,
        iterativeMap,
      });
    } else {
      chain = findImporters({
        id: importer,
        importChain: [],
        getModuleInfo,
        getModuleIds,
        pre: pre.concat(id),
        inputDir,
        iterativeMap,
      });
    }

    const allChain = Array.from(new Set([...chain, ...virtual]));
    importerCache.set(parsedImporter, allChain);

    importChain.push(parsedImporter);
    importChain.push(...allChain);
    importChain = Array.from(new Set(importChain));
  }

  importerCache.set(parsedId, importChain);
  return importChain;
}


export function getPagesJson(inputDir: string, options?: IDispatchScriptOptions) {
  const json = parseJson(readFileSync(path.resolve(inputDir, 'pages.json')));
  const parsed = parsePagesJson(json);

  saveJsonToLogMore(json, './vite-dispatch-script-pages-json-1-raw.json', {
    max: options?.maxLogNumber,
  });
  saveJsonToLogMore(parsed, './vite-dispatch-script-pages-json-2-parsed.json', {
    max: options?.maxLogNumber,
  });
  return parsed;
}

function parsePagesJson(json: PagesJson) {
  const { pages = [], subPackages = [] } = json;
  const mainPages = pages.map(item => item.path);

  const subPackagesMap = subPackages.reduce((acc: Record<string, string>, subPackage) => {
    const { root, pages = [] } = subPackage;
    const subPages = pages.map(page => `${root}/${page.path}`);
    subPages.forEach(page => acc[page] = root);
    return acc;
  }, {});


  return {
    mainPages,
    subPackagesMap,
  };
}


export function checkSubPackage({
  inputDir,
  mainPages,
  subPackagesMap,
  deps,
}: {
  inputDir: string;
  mainPages: string[];
  subPackagesMap: Record<string, string>;
  deps: string[];
}): string[] {
  const entry = path.resolve(inputDir, ENTRY);
  const appVue = path.resolve(inputDir, APP_VUE);

  const list = deps || [];
  const subPackageRoots: string[] = Object.values(subPackagesMap);

  const res: string[] = list.map((item) => {
    // mani.ts 或者 App.vue 使用
    if (item === entry || item === appVue) {
      return MAIN;
    }
    // 被主包页面引用
    const inMapPage = mainPages.find(page => item === `${path.resolve(inputDir, page)}.vue`);
    if (inMapPage) {
      return MAIN;
    }
    // 不一定是分包页面，分包组件引用也当作分包使用了
    const subPackageRoot = subPackageRoots.find(root => item.startsWith(`${path.resolve(inputDir, root)}/`));
    if (subPackageRoot) {
      return subPackageRoot;
    }

    // 不能默认为主包。被主包页面使用，和被主包其他文件使用有本质区别
    // 被主包页面使用，不能分发
    // 被主包其他文件使用，最后还是可以分发到分包
    // 如 src/local-logic/1 => src/local-logic/2 => src/views/sche/1
    return '';
  }).filter(item => item);

  return Array.from(new Set(res));
}


export function staticImportedByEntry(
  id: string,
  getModuleInfo: GetModuleInfo,
  cache: Map<string, boolean>,
  importStack: string[] = [],
): boolean {
  if (cache.has(id)) {
    return cache.get(id) as boolean;
  }
  if (importStack.includes(id)) {
    // circular deps!
    cache.set(id, false);
    return false;
  }
  const mod = getModuleInfo(id);
  if (!mod) {
    cache.set(id, false);
    return false;
  }

  if (mod.isEntry) {
    cache.set(id, true);
    return true;
  }
  const someImporterIs = mod.importers.some(importer => staticImportedByEntry(
    importer,
    getModuleInfo,
    cache,
    importStack.concat(id),
  ));
  cache.set(id, someImporterIs);
  return someImporterIs;
}
