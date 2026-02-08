const fs = require('fs');

const { readFileSync, writeFileSync } = require('t-comm');
const glob = require('glob');

function main() {
  const reg = './packages/*/package.json';
  const list = glob.sync(reg);
  // console.log('list', list);
  const reg2 = /packages\/([^/]+)/;

  list.forEach((item) => {
    const filename = item.match(reg2)[1];
    // console.log('fileName', filename);

    const json = readFileSync(item, true);
    json.homepage = `https://novlan1.github.io/docs/plugin-light/zh/${filename}.html`;


    const readme = `./packages/${filename}/README.md`;

    if (!fs.existsSync(readme)) {
      console.log('not exist', item);
    } else {
      writeFileSync(item, json, true);
    }
  });
}

main();
