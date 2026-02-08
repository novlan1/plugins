import type { ComponentMapList } from './types';

export const MAIN = 'MAIN_PACKAGE';
export { getWxmlAndWxssPostfix } from '@plugin-light/shared';

export function getSubPackageOfComponentOrPage(componentOrPage: string, subPackageMap: ComponentMapList) {
  const subPackages = Object.keys(subPackageMap);

  for (const subPackage of subPackages) {
    if (subPackage === MAIN) {
      continue;
    }
    if (componentOrPage.startsWith(`${subPackage}/`)) {
      return subPackage;
    }
  }

  return MAIN;
}


export const checkPlugin = (componentName: string) => componentName.startsWith('plugin://');
