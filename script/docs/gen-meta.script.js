const fs = require('fs');
const path = require('path');

const { readFileSync, writeFileSync, uploadCOSFile } = require('t-comm');
const glob = require('glob');
require('../env/local');


const COS_INFO =  {
  secretId: process.env.CLOUD_API_SECRET_ID || '',
  secretKey: process.env.CLOUD_API_SECRET_KEY || '',
  bucket: 'image-1251917893',
  region: 'ap-guangzhou',
  dir: 'cyclomatic-complexity',
};


const pkgList = [
  {
    name: 'plugin-light',
    cwd: process.cwd(),
  },
  {
    name: 'press-components',
    cwd: path.resolve(process.cwd(), '../tx-press-components'),
  },
  {
    name: 'pmd-npm',
    cwd: path.resolve(process.cwd(), '../pmd-npm'),
  },
  {
    name: 'pmd-module',
    cwd: path.resolve(process.cwd(), '../pmd-module'),
  },
];


async function getMeta(pkgName = 'plugin-light', cwd) {
  const list = glob.sync([
    './packages/*/package.json',
  ], {
    cwd,
  });
  console.log(`[${pkgName}] list.length`, list.length);
  const nameList = list.map((item) => {
    const content = readFileSync(path.resolve(cwd, item), true);
    return content.name;
  });

  nameList.sort();
  const filePath = path.resolve(__dirname, `./data/${pkgName}-packages.json`);
  const newData = { data: nameList };

  if (fs.existsSync(filePath)) {
    const rawFile = readFileSync(filePath, true);
    if (JSON.stringify(rawFile) === JSON.stringify(newData)) {
      console.log(`[${pkgName}] 无变更`);
      return;
    }
  }

  writeFileSync(filePath, newData,  true);

  if (!COS_INFO.secretId || !COS_INFO.secretKey) {
    console.log(`[${pkgName}] COS_INFO.secretId or COS_INFO.secretKey is empty`);
  } else {
    await uploadCOSFile({
      secretId: COS_INFO.secretId,
      secretKey: COS_INFO.secretKey,
      bucket: COS_INFO.bucket,
      region: COS_INFO.region,
      files: [
        {
          key: `next-svr/files/2025/9/${pkgName}-packages.json`,
          path: filePath,
        },
      ],
    });
  }
}


async function main() {
  for (const item of pkgList) {
    await getMeta(item.name, item.cwd);
  }
}


main();
