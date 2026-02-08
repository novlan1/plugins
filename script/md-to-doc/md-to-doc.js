const path = require('path');

const { execCommand } = require('t-comm');
const glob = require('glob');

const CONFIG = {
  SOURCE_LIST: [
    './docs/zh/**/*.md',
    './docs/work/**/*.md',
  ],
  RESULT_DIR: './docs/docx',
};

const getDocPathIndex = (doc) => {
  const str = doc.replace(/docs\/\w+\//, '').replace(/\.md$/, '');
  const reg = /^(\d+)\./;
  const docIndex = str.match(reg)?.[1] || '';
  return docIndex;
};


function main() {
  execCommand(`rm -rf ${CONFIG.RESULT_DIR}`, undefined, { stdio: 'inherit' });

  const list = glob.sync(CONFIG.SOURCE_LIST);


  list.sort((a, b) => {
    const pureA = getDocPathIndex(a);
    const pureB = getDocPathIndex(b);
    if (pureA && pureB) {
      return +pureA - pureB;
    }
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });
  console.log('Total files: ', list.length);

  for (let index = 0; index < list.length; index++) {
    const item = list[index];

    let filename = path.basename(item, path.extname(item));
    filename = filename.replace(/^\d+\./, '');
    const outputFile = path.resolve(CONFIG.RESULT_DIR, `plugin-light.${index + 1}.${filename}.docx`);
    const dir = path.dirname(outputFile);

    execCommand(`mkdir -p ${dir} && pandoc ${item} -o ${outputFile}`, undefined, {
      stdio: 'inherit',
    });
    console.log('[DONE] ', outputFile);
  }
}


main();
