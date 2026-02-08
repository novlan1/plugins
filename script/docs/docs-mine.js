const { execSync } = require('child_process');


const REPO = 'plugin-light';
const TARGET_DIR = 'docs/.vitepress/dist';
require('../env/local');


function main() {
  execSync(`npx t-comm deploy:github --repo ${REPO} --dir ${TARGET_DIR}`, {
    stdio: 'inherit',
  });
}

main();

