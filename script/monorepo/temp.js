const { readFileSync, writeFileSync } = require('t-comm');
const glob = require('glob');


function main() {
  const list = glob.sync('./packages/*/package.json');
  list.forEach((item) => {
    const json = readFileSync(item, true);
    // const { version, name } = json;
    // const pureName = name.replace('', '');

    // try {
    //   execCommand(`git tag ${pureName}@${version}`, undefined, 'inherit');
    // } catch (err) {

    // }
    if (!json.scripts.release) {
      json.scripts.release = 'node ../../script/monorepo/release $PWD';
    }
    writeFileSync(item, json, true);
  });
}

main();
