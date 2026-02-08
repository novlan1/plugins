import { checkSubPackage } from './core-analyze';
import { MAIN } from './helper';

import type { IterativeMap } from './types';


export function checkImportError({
  inputDir,
  mainPages,
  subPackagesMap,
  iterativeMap,
}: {
  inputDir: string;
  mainPages: string[];
  subPackagesMap: Record<string, string>;
  iterativeMap: IterativeMap;
}) {
  if (!iterativeMap) return [];

  const errorFiles: Record<string, {
    subPackages: string[];
    curSubPackages: string[];
    mainError: boolean;
    subPackageError: boolean;
  }> = {};

  Object.keys(iterativeMap).forEach((file) => {
    const value = iterativeMap[file] || [];
    const subPackages = checkSubPackage({
      inputDir,
      mainPages,
      subPackagesMap,
      deps: [
        ...value.importers,
        ...value.dynamic,
      ],
    });

    const curSubPackages = checkSubPackage({
      inputDir,
      mainPages,
      subPackagesMap,
      deps: [file],
    });

    const curSubPackage = curSubPackages[0] || MAIN;


    // 文件属于子包，被主包引用
    const mainError = curSubPackage !== MAIN && !!subPackages.find(item => item === MAIN);
    // 文件属于子包，被其他子包子包
    const subPackageError = curSubPackage !== MAIN
    && !!subPackages.find(item => item !== MAIN && item !== curSubPackage);

    const isError = mainError || subPackageError;

    if (isError) {
      errorFiles[file] = {
        subPackages,
        curSubPackages,
        mainError,
        subPackageError,
      };
    }
  });

  return errorFiles;
}
