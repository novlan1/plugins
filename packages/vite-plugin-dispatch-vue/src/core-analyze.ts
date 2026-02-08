import {
  isInBlackList,
} from '@plugin-light/shared';
import {
  parseComponentPath,
  readJson,
} from 't-comm';


import {
  checkPlugin,
  MAIN,
} from './helper';

import type {
  BaseComponentMap,
  Bundle,
  ComponentMap,
  ComponentMapList,
  IDispatchVueOptions,
} from './types';


export function getPages(bundle: Bundle) {
  const data = readJson(bundle['app.json'].source.toString(), 'app.json');

  const { pages = [], subPackages = [], usingComponents = {} } = data;

  const subPackageMap =  {
    [MAIN]: pages,
  };

  const parsedSubPackages = subPackages.reduce((acc: Record<string, any>, subPackage: any) => {
    const { root, pages = [] } = subPackage;
    const list = pages.map((page: string) => [root, page].join('/'));

    acc[root] = list;
    return acc;
  }, subPackageMap);

  const reversedSubPackageMap = Object.keys(parsedSubPackages).reduce((acc: Record<string, string>, subPackage) => {
    const pagesList = parsedSubPackages[subPackage];
    pagesList.forEach((page: string) => {
      acc[page] = subPackage;
    });
    return acc;
  }, {});


  return {
    pages,
    subPackages,
    parsedSubPackages,
    reversedSubPackageMap,
    globalComponents: usingComponents,
  };
}


const getComponentName = ({ file, files, htmlPostfix }: {
  file: string;
  files: Array<string>;
  htmlPostfix: string;
}) => {
  if (file.endsWith('.js')) {
    const xml = file.replace(/\.js$/, htmlPostfix);
    if (files.includes(xml)) {
      return file.replace(/\.js$/, '');
    }
  }

  return '';
};

export function analyzeComponent(bundle: Bundle, htmlPostfix: string) {
  const rawComponentMap: ComponentMap =  {};
  const files = Object.keys(bundle);

  files.forEach((file) => {
    const componentName = getComponentName({
      file,
      files,
      htmlPostfix,
    });

    if (componentName && !rawComponentMap[componentName]) {
      const jsonName = `${componentName}.json`;
      const json = bundle[jsonName];
      if (!json) {
        console.log(`>>> dispatch vue can't find json: ${jsonName}`);
      } else {
        const jsonContent = readJson(json.source.toString(), jsonName);
        const { usingComponents = {} } = jsonContent;

        const parsed = Object.keys(usingComponents).reduce((acc: Record<string, string>, name) => {
          if (checkPlugin(usingComponents[name])) {
            console.log(`>>> dispatch vue found plugin, file: ${file}, name: ${name}, plugin: ${usingComponents[name]}`);
          } else {
            acc[name] = usingComponents[name];
          }
          return acc;
        }, {});

        rawComponentMap[componentName] = parsed;
      }
    }
  });

  return rawComponentMap;
}


export function formatComponentMap(componentMap: ComponentMap = {}) {
  const result = Object.keys(componentMap).reduce((acc: ComponentMap, filePath) => {
    const parsed = innerFormatComponentMap(filePath, componentMap[filePath]);
    acc[filePath] = parsed;
    return acc;
  }, {});
  return result;
}


function innerFormatComponentMap(file: string, usingComponents: BaseComponentMap = {}) {
  const result = Object.keys(usingComponents).reduce((acc: BaseComponentMap, componentName) => {
    const parsed = parseComponentPath(file, usingComponents[componentName]);
    acc[parsed] = usingComponents[componentName];
    return acc;
  }, {});
  return result;
}


export function getComponentMapList(componentMap: ComponentMap) {
  const list = Object.keys(componentMap);
  const result: ComponentMapList = {};

  list.forEach((component) => {
    const usingComponents = componentMap[component];

    const values = Object.keys(usingComponents);

    result[component] = values;
  });
  return result;
}


export function getDeepComponentMapList(componentMap: ComponentMapList) {
  const list = Object.keys(componentMap);
  const result: ComponentMapList = {};

  list.forEach((component) => {
    const usingComponents = componentMap[component];

    const values = Object.values(usingComponents);

    usingComponents.forEach((inner) => {
      if (componentMap[inner]) {
        values.push(...componentMap[inner]);
      }
    });

    result[component] = values;
  });
  return result;
}


export function getReversedComponentMapList(componentMap: ComponentMapList) {
  const list = Object.keys(componentMap);
  const result: ComponentMapList = {};

  list.forEach((componentOrPage) => {
    const usingComponents = componentMap[componentOrPage];


    usingComponents.forEach((inner) => {
      if (!result[inner]) {
        result[inner] = [componentOrPage];
      } else if (!result[inner].includes(componentOrPage)) {
        result[inner].push(componentOrPage);
      }
    });
  });
  return result;
}

export function getReversedComponentSubPackages(
  componentMap: ComponentMapList,
  reversedSubPackageMap: BaseComponentMap,
) {
  const list = Object.keys(componentMap);
  const result: ComponentMapList = {};

  list.forEach((component) => {
    const usingComponents = componentMap[component];


    usingComponents.forEach((inner) => {
      const subPackage = getComponentSubPackage(inner, reversedSubPackageMap);
      if (subPackage) {
        if (!result[component]) {
          result[component] = [subPackage];
        } else if (!result[component].includes(subPackage)) {
          result[component].push(subPackage);
        }
      }
    });
  });
  return result;
}

function getComponentSubPackage(componentPath: string, reversedSubPackageMap: BaseComponentMap) {
  const pages = Object.keys(reversedSubPackageMap);
  for (const page of pages) {
    if (componentPath.startsWith(page)) {
      return reversedSubPackageMap[page];
    }
  }
  return '';
}


function getComponentSubPackageFromRoot(componentPath: string, reversedSubPackageMap: BaseComponentMap) {
  const subPackages = Object.values(reversedSubPackageMap);
  for (let subPackage of subPackages) {
    if (!subPackage.endsWith('/')) {
      subPackage += '/';
    }

    if (componentPath.startsWith(subPackage)) {
      return subPackage.replace(/\/$/, '');
    }
  }
  return '';
}


export function findShouldHandleComponents({
  componentMap,
  reversedSubPackageMap,
  limit,
  blackList,
}: {
  componentMap: ComponentMapList;
  reversedSubPackageMap: BaseComponentMap;
  limit?: number;
  blackList?: IDispatchVueOptions['blackList'];
}) {
  const list = Object.keys(componentMap);
  const result = list.filter((component) => {
    const subPackages = componentMap[component];
    if (subPackages.includes(MAIN)) {
      return false;
    }

    if (blackList && isInBlackList(component, blackList)) {
      return false;
    }

    if (limit) {
      return subPackages.length <= limit;
    }
    return true;
  }).reduce((acc: Record<string, string[]>, component) => {
    // 如果组件自身已经在分包中了，则应该排除
    const subPackage = getComponentSubPackageFromRoot(component, reversedSubPackageMap);

    const subs = componentMap[component].filter(sub => sub !== subPackage);

    if (subs.length) {
      acc[component] = subs;
    }
    return acc;
  }, {});
  return result;
}
