const { execSync } = require('child_process');
require('../env/local');

function main() {
  const sourceDir = 'docs/.vitepress/dist';
  const targetDir = '/root/html/plugin-light';
  const hostName = process.env.HOST_NAME;
  const hostPwd =  process.env.HOST_PWD;

  execSync(`t-comm publish -s ${sourceDir} -t ${targetDir} -n ${hostName} -p "${hostPwd}"`, {
    stdio: 'inherit',
  });
}

main();
