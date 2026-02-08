const fs = require('fs');

const { camelize, capitalize, execCommand, readFileSync, writeFileSync } = require('t-comm');
const glob = require('glob');
const SIDEBAR_CONFIG_PATH = './docs/.vitepress/sidebar.json';
const SIDEBAR_CHANGELOG_CONFIG_PATH = './docs/.vitepress/sidebar-changelog.json';


const PREFIX_NAME_MAP = {
  'project-config-': 'project-config',
  'webpack-plugin-': 'webpack-plugin',
  'vite-plugin-': 'vite-plugin',
  'postcss-plugin-': 'postcss-plugin',
  'eslint-': 'eslint-plugin',
  'stylelint-': 'stylelint',
  'webpack-loader-': 'webpack-loader',

  'plugin-light-shared': 'base',
  'plugin-light-const': 'base',
  'plugin-light-shared-vue2': 'base',
  'plugin-light-preprocess': 'base',
  'uni-read-pages-vite': 'base',
  'import-meta-resolve': 'base',
  'plugin-light-cli': 'base',

  'vconsole-helper': 'runtime',
  'share-light': 'runtime',
  'ebus-light': 'runtime',

  'pixui-runtime': 'pixui',
  'pixui-fetch': 'pixui',
  'pixui-polyfill': 'pixui',

  'net-cli': 'cli',

  'upload-mcp': 'mcp',
  'npm-publish-mcp': 'mcp',
  'mp-publish-mcp': 'mcp',
};
const CHANGELOG_DIR = 'changelog';

function getType(pkgName) {
  const keys = Object.keys(PREFIX_NAME_MAP);

  for (const key of keys) {
    if (pkgName.startsWith(key)) {
      return PREFIX_NAME_MAP[key];
    }
  }
  return 'unknown';
}

function traverseEveryFolder() {
  const target = './packages/*/README.md';
  const list = [];
  const globList = glob.sync(target);

  globList.sort((a, b) => {
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  });
  globList.forEach((item) => {
    console.log(item);
    const reg = /packages\/([\w-]+)\/README.md/;
    const match = item.match(reg);
    const name = match[1];
    const type = getType(name);
    const targetDir = './docs/zh';
    const target = `${targetDir}/${name}.md`;


    let info = {
      file: item,
      name,
      type,

      targetDir,
      target,
    };

    const changelogSource = item.replace(/README.md$/, 'CHANGELOG.md');
    if (fs.existsSync(changelogSource)) {
      info = {
        ...info,
        changelogSource,
        changelogTarget: `./docs/${CHANGELOG_DIR}/${name}.md`,
      };
    }

    list.push(info);
  });

  return list;
}


function getMdTitle(file) {
  const reg = /^#\s+(.*)/;
  const data = fs.readFileSync(file, {
    encoding: 'utf-8',
  });
  const match = data.match(reg);
  if (match?.[1]) {
    return match[1].trim();
  }
}


function genSidebarJson(list) {
  function filterList(type, useEnName = false, removePrefix = '') {
    return list
      .filter(item => item.type === type)
      .map((item) => {
        const link = item.target.replace('./docs', '');
        const text = getMdTitle(item.file);
        let parsedName = capitalize(camelize(item.name)).replace(removePrefix, '');
        if (parsedName === 'NetCli') {
          parsedName = 'NetCLI';
        }

        return {
          text: useEnName ? `${parsedName} ${text}` : (text || item.name),
          link,
        };
      });
  }

  const baseConfig = [
    {
      text: '项目配置',
      collapsed: false,
      items: filterList('project-config'),
    },
    {
      text: 'ESLint',
      collapsed: false,
      items: filterList('eslint-plugin'),
    },
    {
      text: 'StyleLint',
      collapsed: false,
      items: filterList('stylelint'),
    },
    {
      text: '运行时',
      collapsed: false,
      items: filterList('runtime', true),
    },
    {
      text: 'PixUI',
      collapsed: false,
      items: filterList('pixui', true),
    },
    {
      text: '脚手架',
      collapsed: false,
      items: filterList('cli', true),
    },
    {
      text: '底层依赖',
      collapsed: false,
      items: filterList('base', true),
    },
    {
      text: 'Vite 插件',
      collapsed: true,
      items: filterList('vite-plugin', true, 'VitePlugin'),
    },
    {
      text: 'Webpack 插件',
      collapsed: true,
      items: filterList('webpack-plugin', true, 'WebpackPlugin'),
    },
    {
      text: 'Webpack Loader',
      collapsed: true,
      items: filterList('webpack-loader', true, 'WebpackLoader'),
    },
    {
      text: 'Postcss 插件',
      collapsed: true,
      items: filterList('postcss-plugin', true, 'PostcssPlugin'),
    },
    {
      text: 'MCP',
      collapsed: true,
      items: filterList('mcp', true),
    },
  ];

  return {
    sidebar: baseConfig,
  };
}


function genSidebarChangelogJson(list) {
  const result = list.map(item => ({
    text: item.name,
    link: `/changelog/${item.name}.md`,
  }));
  return {
    sidebar: result,
  };
}

/**
 * 1. 拷贝 docs
 * 2. 生成 sidebar
 */
function main() {
  const list = traverseEveryFolder();
  // console.log('list', list);
  const sidebar = genSidebarJson(list);
  const sidebarChangelog = genSidebarChangelogJson(list);

  execCommand('rm -rf ./docs/zh/*', process.cwd(), 'inherit');

  list.forEach((item) => {
    const readMe = readFileSync(item.file);
    const newReadMe = readMe.replace('./CHANGELOG.md', `../${CHANGELOG_DIR}/${item.name}.md`);


    writeFileSync(item.target, newReadMe);

    if (item.changelogSource && item.changelogTarget) {
      const content = readFileSync(item.changelogSource);
      writeFileSync(item.changelogTarget, `# ${item.name}\n\n${content}`);
    }
  });

  writeFileSync(SIDEBAR_CONFIG_PATH, sidebar, true);
  writeFileSync(SIDEBAR_CHANGELOG_CONFIG_PATH, sidebarChangelog, true);
}

main();
