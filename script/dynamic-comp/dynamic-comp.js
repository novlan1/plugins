/**
 * 替换项目中动态引用组件
 *
 * require(['xxx', resolve])
 */

const { readFileSync, writeFileSync } = require('t-comm');
const glob = require('glob');


function transformDynamicComp(source = '') {
  // source = source.replaceAll(/\(\)\s*=>\s*import\('.*?'\)/, '1');

  const reg = new RegExp(/(([a-zA-Z]+?)\(resolve\)(?:\s*?)\{(?:\n\s*)require\(\['(.*?)'\],(?:\s*?)resolve\);(?:\n\s*)\})+/, 'g');
  const match = [...source.matchAll(reg)];
  if (!match?.length) return source;
  const compList = match.map(item => ({
    name: item[2],
    file: item[3],
  }));
  const importStr = compList.reduce((acc, item) => {
    acc += `import ${item.name} from '${item.file}';\n`;
    return acc;
  }, '');


  const scriptReg = new RegExp('<script>');
  let newSource = source.replace(scriptReg, () => `<script>\n${importStr}`);

  for (const item of compList) {
    const { name, file } = item;
    const compReg = new RegExp(`${name}\\(resolve\\)\\s*\\{\\n\\s*require\\(\\['(${file})'\\],\\s*resolve\\);?\\n*\\s*\\}`);
    newSource = newSource.replace(compReg, () => `${name}`);
  }

  // @ts-ignore
  // const { resourcePath } = this;

  // recordLoaderLog('transform-dynamic-comp.result.json', {
  //   file: getRelativePath(resourcePath),
  //   component: compList.map(item => item.name).join(','),
  // });
  return newSource;
}


// const content = `
// <script>
// export default {
//   components: {
//     ModuleTipMatchGlobalNotice(resolve) {
//       require(['src/local-component/module/tip-match/tip-match-global-notice/index.vue'], resolve);
//     },
//     UiTipMatchAuthLogin(resolve) {
//       require(['src/local-component/ui/tip-match/tip-match-auth-login/index.vue'], resolve);
//     },
// `;
// const res = transformDynamicComp(content);


function main() {
  const globReg = '/Users/yang/Documents/git-aow/pvp-next/**/*.vue';

  const list = glob.sync(globReg);
  list.forEach((file) => {
    console.log('file.1', file);
    const content = readFileSync(file);
    if (content.includes('require([\'') && !file.includes('node_modules')) {
      console.log('file', file);
      const newContent = transformDynamicComp(content);
      writeFileSync(file, newContent);
    }
  });
}


main();
