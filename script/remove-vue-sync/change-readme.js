const { readFileSync, writeFileSync } = require('t-comm');
const glob = require('glob');

function main() {
  const reg = './packages/*/README.md';
  const list = glob.sync(reg);
  // console.log('list', list);
  const reg2 = /packages\/([^/]+)/;

  list.slice(0, 3000).forEach((item) => {
    const filename = item.match(reg2)[1];
    // console.log('fileName', filename);

    const content = readFileSync(item, true);
    if (!content.includes('shields.io')) {
      const newContent = content.replace(/##[\s\S]+?\n/, a => `${a}
<p align="center">
  <img src="https://img.shields.io/npm/dw/@plugin-light/${filename}">
  <img src="https://img.shields.io/npm/unpacked-size/@plugin-light/${filename}">
  <img src="https://img.shields.io/npm/v/@plugin-light/${filename}">
  <img src="https://img.shields.io/npm/l/@plugin-light/${filename}">
  <img src="https://img.shields.io/github/last-commit/novlan1/plugin-light">
  <img src="https://img.shields.io/github/created-at/novlan1/plugin-light">
</p>

        `);
      writeFileSync(item, newContent);
    }
  });
}

main();
