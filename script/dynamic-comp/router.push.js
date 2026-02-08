const { readFileSync, writeFileSync } = require('t-comm');

const glob = require('glob');

const { parsedNamePagesJsonPath } = require('./config');


function getNamePagesMap() {
  return readFileSync(parsedNamePagesJsonPath, true);
}


function replaceRouterPush(content, namePagesMap) {
  const reg = /this\.\$router\.push\(\{name:\s*'([\w-]+)',\s*params:\s*\{\s*([\s\S]+)\s*\}\}\)/;
  const match = content.match(reg);
  console.log('match', match);
  const nameReg = /name:\s*'([\w-]+)',\s*params:\s*\{\s*([\s\S]+)\s*\}/;
  if (!match) return;

  const inner = match[1];
  const innerMatch = inner.match(nameReg);
  console.log('inner', innerMatch);
  if  (!innerMatch) return;

  const { 1: routerName, 2: paramStr } = innerMatch;
  const params = {};
  paramStr.split(',').map((item) => {
    const tempList = item.split(':').map(temp => temp.trim());
    params[tempList[0]] = tempList[1];
  });

  console.log('routerName', routerName);
  console.log('params', params);
  const newParamStr = Object.keys(params).map(item => `${item}=$\{${params[item]}}`)
    .join('&');
  const routerPath = namePagesMap[routerName];
  return content.replace(reg, `uni.navigateTo({ url: \`/${routerPath}?${newParamStr}\` })`);
}


function main() {
  // const pagesMap = getPagesMap();
  // const namePagesMap = getNamePagesMap();

  // const result = replaceRouterPush(namePagesMap);

  // console.log('result', result);
  replace();
}

function replace() {
  const globReg = '/Users/yang/Documents/git-aow/pvp-next/**/*.vue';
  const namePagesMap = getNamePagesMap();

  const list = glob.sync(globReg);
  console.log('list', list);
  list.forEach((file) => {
    console.log('file.1', file);
    const content = readFileSync(file);
    if (content.includes('$router') && !file.includes('node_modules')) {
      console.log('file', file);
      const newContent = replaceRouterPush(content, namePagesMap);
      if (newContent) {
        writeFileSync(file, newContent);
      }
    }
  });
}

main();
