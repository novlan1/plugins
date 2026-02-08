
/**
 * 解析 pages.json
 */
const { readFileSync, writeFileSync } = require('t-comm');

const { parsedNamePagesJsonPath, parsedPagesJsonPath } = require('./config');

const JSON_PATH = '/Users/yang/Documents/git-aow/gp-next/src/project/gp/pages.json';
const newPagesJsonPath = './script/dynamic-comp/data/parsed.json';

// 一次性任务
function parsePagesJson() {
  const content = readFileSync(JSON_PATH);
  const reg = /\n\s*\/\/[\s\S]+?\n/g;
  const newContent = content.replace(reg, '');


  writeFileSync(newPagesJsonPath, newContent);
}
module.exports = { parsePagesJson };
// parsePagesJson();


function parseNewPagesJson() {
  const json = readFileSync(newPagesJsonPath, true);
  const { pages = [], subPackages = [] } = json;

  const obj = {};
  const nameObj = {};
  pages.forEach((item) => {
    obj[item.aliasPath] = item.path;
    nameObj[item.name] = item.path;
  });


  subPackages.forEach((item) => {
    const { root = '', pages = [] } = item;
    pages.forEach((page) => {
      obj[page.aliasPath] =  `${root}/${page.path}`;
      nameObj[page.name] =  `${root}/${page.path}`;
    });
  });


  writeFileSync(parsedPagesJsonPath, obj, true);
  writeFileSync(parsedNamePagesJsonPath, nameObj, true);
}

parseNewPagesJson();
