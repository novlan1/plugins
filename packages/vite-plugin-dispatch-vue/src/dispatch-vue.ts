import fs from 'node:fs';
import path from 'node:path';

import type { Plugin } from 'vite';

import { getWxmlAndWxssPostfix } from '@plugin-light/shared';
import {
  deleteFolderRecursive,
  flattenUsingComponentMap,
  genIterativeComponentMap,
  getRelativePath,
  parseComponentPath,
  randomString,
  saveJsonToLogMore,
} from 't-comm';


import {
  analyzeComponent,
  findShouldHandleComponents,
  formatComponentMap,
  getComponentMapList,
  getPages,
  // getDeepComponentMapList,
  getReversedComponentMapList,
  getReversedComponentSubPackages,
} from './core-analyze';
import {
  getSubPackageOfComponentOrPage,
} from './helper';

import type {
  Bundle,
  ComponentMap,
  ComponentMapList,
  IDispatchVueOptions,
  IReplacedComponentRefMap,
} from './types';


let isFixed = false;


const TEMP_SYMBOL = '&&&&&&TEMPLATE_STRING&&&&&&&';

const toDeleteFiles: string[] = [];
const toModifyFiles: Record<string, string> = {};


export function dispatchVueVitePlugin(options?: IDispatchVueOptions): Plugin {
  return {
    name: 'dispatch-vue-vite-plugin',
    enforce: 'post',
    generateBundle(_: any, bundle: Bundle)  {
      const { emitFile } = this;
      if (isFixed) {
        return;
      }

      console.log('>>> vite dispatch vue start');
      isFixed = true;

      const keys = Object.keys(bundle);
      saveJsonToLogMore(keys, 'vite-dispatch-vue.bundle-keys.json', {
        max: options?.maxLogNumber,
      });

      const limit = options?.limit ?? 1;
      const dispatchDir = options?.dispatchDir ?? `dispatch-vue-${randomString(8)}`;
      const blackList = options?.blackList;

      const [
        wxmlPostfix,
        wxssPostfix,
      ] = getWxmlAndWxssPostfix();

      const { pages, parsedSubPackages, reversedSubPackageMap, globalComponents } = getPages(bundle);

      const rawComponentMap = analyzeComponent(bundle, wxmlPostfix);

      // 全局组件放到主包，这样就不会分发
      if (pages[0]) {
        rawComponentMap[pages[0]] = {
          ...(rawComponentMap[pages[0]] || {}),
          ...(globalComponents || {}),
        };
      }

      const parsedComponentMap = formatComponentMap(rawComponentMap);
      const parsedComponentMapList = getComponentMapList(parsedComponentMap);

      const toIterativeMap = Object.keys(parsedComponentMapList)
        .reduce((acc: Record<string, Record<string, object>>, item: string) => {
          const list = parsedComponentMapList[item];
          list.forEach((it) => {
            acc[item] = {
              ...(acc[item] || {}),
              [it]: {},
            };
          });
          return acc;
        }, {});

      genIterativeComponentMap(toIterativeMap);

      const flattenedComponentMap = flattenUsingComponentMap(toIterativeMap);

      const reversedComponentMap = getReversedComponentMapList(flattenedComponentMap);
      // const reversedComponentMapDeep = getDeepComponentMapList(reversedComponentMap);
      const reversedComponentSubPackages = getReversedComponentSubPackages(
        reversedComponentMap,
        reversedSubPackageMap,
      );

      const shouldHandleComponentsMap = findShouldHandleComponents({
        componentMap: reversedComponentSubPackages,
        limit,
        blackList,
        reversedSubPackageMap,
      });
      const shouldHandleComponents = Object.keys(shouldHandleComponentsMap);

      modifyRef({
        shouldHandleComponents,
        reversedComponentMap,
        parsedComponentMap,
        parsedSubPackages,

        bundle,
        wxmlPostfix,
        wxssPostfix,
        dispatchDir,
      });

      const replacedComponentRefMap = dispatchComponent({
        shouldHandleComponents,
        bundle,

        wxmlPostfix,
        wxssPostfix,

        reversedComponentSubPackages,
        emitFile,
        dispatchDir,
      });

      saveJsonToLogMore(rawComponentMap, 'vite-dispatch-vue.component-map-1-raw.json', {
        max: options?.maxLogNumber,
      });

      saveJsonToLogMore(parsedComponentMap, 'vite-dispatch-vue.component-map-2-parsed.json', {
        max: options?.maxLogNumber,
      });

      saveJsonToLogMore(parsedComponentMapList, 'vite-dispatch-vue.component-map-3-list.json', {
        max: options?.maxLogNumber,
      });

      saveJsonToLogMore(toIterativeMap, 'vite-dispatch-vue.component-map-4-iterative.json', {
        max: options?.maxLogNumber,
      });

      saveJsonToLogMore(flattenedComponentMap, 'vite-dispatch-vue.component-map-5-flatten.json', {
        max: options?.maxLogNumber,
      });

      saveJsonToLogMore(reversedComponentMap, 'vite-dispatch-vue.component-map-6-reversed.json', {
        max: options?.maxLogNumber,
      });

      saveJsonToLogMore(reversedComponentSubPackages, 'vite-dispatch-vue.component-map-7-sub-packages.json', {
        max: options?.maxLogNumber,
      });

      saveJsonToLogMore(shouldHandleComponentsMap, 'vite-dispatch-vue.should-handle-components.json', {
        max: options?.maxLogNumber,
      });

      saveJsonToLogMore(reversedSubPackageMap, 'vite-dispatch-vue.sub-package-map-2-reversed.json', {
        max: options?.maxLogNumber,
      });

      saveJsonToLogMore(parsedSubPackages, 'vite-dispatch-vue.sub-package-map-1-parsed.json', {
        max: options?.maxLogNumber,
      });

      saveJsonToLogMore(replacedComponentRefMap, 'vite-dispatch-vue.replace-component-ref-record.json', {
        max: options?.maxLogNumber,
      });

      console.log('>>> vite dispatch vue end');
    },
    writeBundle() {
      const getDistPath = (file: string) => path.resolve(process.env.UNI_OUTPUT_DIR || '', file);

      toDeleteFiles.forEach((file) => {
        const filePath = getDistPath(file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      deleteFolderRecursive(process.env.UNI_OUTPUT_DIR || '', {
        deleteFile: false,
        log: false,
      });

      Object.keys(toModifyFiles).forEach((file) => {
        const content = toModifyFiles[file];
        const filePath = getDistPath(file);
        if (fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, content, {
            encoding: 'utf-8',
          });
        }
      });
    },
  };
}


function dispatchComponent({
  shouldHandleComponents,
  bundle,

  wxmlPostfix,
  wxssPostfix,

  reversedComponentSubPackages,
  emitFile,
  dispatchDir,
}: {
  shouldHandleComponents: Array<string>;
  bundle: Bundle;

  wxmlPostfix: string;
  wxssPostfix: string;

  reversedComponentSubPackages: ComponentMapList;
  emitFile: Function;
  dispatchDir: string;
}) {
  const replacedComponentRefMap: IReplacedComponentRefMap = {};
  for (const component of shouldHandleComponents) {
    const subPackages = reversedComponentSubPackages[component];

    for (const subPackage of subPackages) {
      const newDir = `${subPackage}/${dispatchDir}`;

      const dispatchedComponentNewPath = `${newDir}/${component}`;

      copyComponent({
        dispatchedComponentNewPath,
        dispatchedComponentOriginPath: component,

        wxmlPostfix,
        wxssPostfix,

        bundle,
        emitFile,

        subPackage,
        shouldHandleComponents,
        dispatchDir,

        replacedComponentRefMap,
      });

      deleteComponent({
        dispatchedComponentOriginPath: component,
        bundle,
        wxmlPostfix,
        wxssPostfix,
      });
    }
  }

  return replacedComponentRefMap;
}

function copyComponent({
  dispatchedComponentNewPath,
  dispatchedComponentOriginPath,
  bundle,

  wxmlPostfix,
  wxssPostfix,
  emitFile,
  subPackage,

  shouldHandleComponents,
  dispatchDir,

  replacedComponentRefMap,
}: {
  dispatchedComponentNewPath: string;
  dispatchedComponentOriginPath: string;
  bundle: Bundle;

  wxmlPostfix: string;
  wxssPostfix: string;
  emitFile: Function;
  subPackage: string;

  shouldHandleComponents: string[];
  dispatchDir: string;

  replacedComponentRefMap: IReplacedComponentRefMap;
}) {
  addBundle({
    dispatchedComponentNewPath,
    dispatchedComponentOriginPath,
    postfix: '.json',
    bundle,

    emitFile,
    subPackage,
    shouldHandleComponents,
    dispatchDir,
    replacedComponentRefMap,
  });
  addBundle({
    dispatchedComponentNewPath,
    dispatchedComponentOriginPath,
    postfix: '.js',
    bundle,

    emitFile,
    subPackage,
    shouldHandleComponents,
    dispatchDir,
    replacedComponentRefMap,
  });
  addBundle({
    dispatchedComponentNewPath,
    dispatchedComponentOriginPath,
    postfix: wxmlPostfix,
    bundle,

    emitFile,
    subPackage,
    shouldHandleComponents,
    dispatchDir,
    replacedComponentRefMap,
  });
  addBundle({
    dispatchedComponentNewPath,
    dispatchedComponentOriginPath,
    postfix: wxssPostfix,
    bundle,

    emitFile,
    subPackage,
    shouldHandleComponents,
    dispatchDir,
    replacedComponentRefMap,
  });
}


function addBundle({
  dispatchedComponentNewPath,
  dispatchedComponentOriginPath,
  postfix,

  bundle,
  emitFile,
  subPackage,
  shouldHandleComponents,
  dispatchDir,

  replacedComponentRefMap,
}: {
  dispatchedComponentNewPath: string;
  dispatchedComponentOriginPath: string;
  postfix: string;

  bundle: Bundle;
  emitFile: Function;
  subPackage: string,
  shouldHandleComponents: string[],
  dispatchDir: string

  replacedComponentRefMap: IReplacedComponentRefMap;
}) {
  const origin = `${dispatchedComponentOriginPath}${postfix}`;
  if (!bundle[origin]) {
    console.warn(`not found ${origin}`);
    return;
  }

  let source = (bundle[origin].source || bundle[origin].code);
  if (!source) {
    source = '';
  }

  source = replaceFilePathByReg({
    source,
    dispatchedComponentNewPath,
    dispatchedComponentOriginPath,
    subPackage,
    shouldHandleComponents,
    dispatchDir,

    replacedComponentRefMap,
  });

  source = source.toString();
  emitFile({
    type: 'asset',
    fileName: `${dispatchedComponentNewPath}${postfix}`,
    source,
  });
}


function modifyRef({
  shouldHandleComponents,
  reversedComponentMap,
  parsedComponentMap,
  parsedSubPackages,

  bundle,
  wxmlPostfix,
  wxssPostfix,
  dispatchDir,
}: {
  shouldHandleComponents: Array<string>;
  reversedComponentMap: ComponentMapList;
  parsedComponentMap: ComponentMap;
  parsedSubPackages: ComponentMapList;

  bundle: Bundle;
  wxmlPostfix: string;
  wxssPostfix: string;
  dispatchDir: string;
}) {
  for (const component of shouldHandleComponents) {
    const componentsOrPages = reversedComponentMap[component];

    for (const componentOrPage of componentsOrPages) {
      if (shouldHandleComponents.includes(componentOrPage)) continue;

      // 之前的组件引入路径，如 ../../xxx
      const componentImportation = parsedComponentMap[componentOrPage][component];
      const subPackage = getSubPackageOfComponentOrPage(componentOrPage, parsedSubPackages);

      const newImportation = [subPackage, dispatchDir, component].join('/');

      innerModifyRef({
        bundle,
        componentOrPage,

        componentImportation,
        newImportation,

        postfix: '.json',
        record: false,
      });

      innerModifyRef({
        bundle,
        componentOrPage,

        componentImportation,
        newImportation,

        postfix: '.js',
        record: true,
      });

      innerModifyRef({
        bundle,
        componentOrPage,

        componentImportation,
        newImportation,

        postfix: wxmlPostfix,
      });

      innerModifyRef({
        bundle,
        componentOrPage,

        componentImportation,
        newImportation,

        postfix: wxssPostfix,
        record: true,
      });
    }
  }
}

function innerModifyRef({
  bundle,
  componentOrPage,

  componentImportation,
  newImportation,

  postfix,
  record = false,
}: {
  bundle: Bundle;
  componentOrPage: string;

  componentImportation: string;
  newImportation: string;

  postfix: string;
  record?: boolean;
}) {
  const fileName = `${componentOrPage}${postfix}`;
  const file = bundle[fileName];
  if (!file) {
    console.error(`>>> dispatch vue error: not found ${fileName}`);
  }
  let key = 'source';
  if (postfix === '.js') {
    key = 'code';
  }

  const source = file[key].toString();
  const relativePath = getRelativePath(componentOrPage, newImportation)
    .split(path.sep)
    .join('/');
  file[key] = source.replaceAll(componentImportation, relativePath);

  if (record) {
    toModifyFiles[fileName] = file[key];
  }
}


function deleteComponent({
  dispatchedComponentOriginPath,
  // bundle,
  wxmlPostfix,
  wxssPostfix,
}: {
  dispatchedComponentOriginPath: string;
  bundle: Bundle;
  wxmlPostfix: string;
  wxssPostfix: string;
}) {
  // js 文件和 wxss 文件，无法通过 generateBundle 钩子删除
  toDeleteFiles.push(`${dispatchedComponentOriginPath}.js`);
  toDeleteFiles.push(`${dispatchedComponentOriginPath}${wxssPostfix}`);


  // json 文件也不从 generateBundle 钩子中删除，防止复制（emitFile）的时候找不到
  toDeleteFiles.push(`${dispatchedComponentOriginPath}.json`);
  toDeleteFiles.push(`${dispatchedComponentOriginPath}${wxmlPostfix}`);

  // delete bundle[`${dispatchedComponentOriginPath}.json`];
  // delete bundle[`${dispatchedComponentOriginPath}${wxmlPostfix}`];
}


function replaceFilePathByReg({
  source,
  dispatchedComponentOriginPath,
  dispatchedComponentNewPath,
  subPackage,
  shouldHandleComponents,
  dispatchDir,

  replacedComponentRefMap,
}: {
  source: string;
  dispatchedComponentOriginPath: string;
  dispatchedComponentNewPath: string;
  subPackage: string;
  shouldHandleComponents: string[];
  dispatchDir: string;
  replacedComponentRefMap: IReplacedComponentRefMap;
}) {
  const reg = /('|")(\.\.?\/[/\w-.@]+)(?:'|")/g;

  let newSource = source;
  let match = reg.exec(newSource);
  while (match) {
    const { 0: origin, 1: quoteSymbol, 2: pre } = match;
    const target = genTarget({
      originImportation: pre,
      dispatchedComponentOriginPath,
      dispatchedComponentNewPath,
      subPackage,
      shouldHandleComponents,
      dispatchDir,
    });

    const newContent = `${quoteSymbol}${TEMP_SYMBOL}${target}${TEMP_SYMBOL}${quoteSymbol}`;
    newSource = newSource.replace(origin, newContent);


    replacedComponentRefMap[dispatchedComponentOriginPath] = [
      ...(replacedComponentRefMap[dispatchedComponentOriginPath] || []),
      { [origin]: newContent },
    ];
    match = reg.exec(newSource);
  }

  newSource = newSource.replace(new RegExp(TEMP_SYMBOL, 'g'), '');

  return newSource;
}


function genTarget({
  originImportation,
  dispatchedComponentOriginPath,
  dispatchedComponentNewPath,
  subPackage,
  shouldHandleComponents,
  dispatchDir,
}: {
  originImportation: string;
  dispatchedComponentOriginPath: string;
  dispatchedComponentNewPath: string;
  subPackage: string;
  shouldHandleComponents: string[];
  dispatchDir: string;
}) {
  let filePath = parseComponentPath(dispatchedComponentOriginPath, originImportation);
  if (shouldHandleComponents.includes(filePath)) {
    filePath = [subPackage, dispatchDir, filePath].join('/');
  }
  const relativePath = getRelativePath(dispatchedComponentNewPath, filePath);

  return relativePath
    .split(path.sep)
    .join('/');
}
