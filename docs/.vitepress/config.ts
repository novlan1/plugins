import { withMermaid } from 'vitepress-plugin-mermaid';

import { getFooterMessage } from './footer';
import sidebarChangelogConfig from './sidebar-changelog.json';
import { SIDEBAR_WORK_DOCS } from './sidebar-work-docs';
import sidebarConfig from './sidebar.json';

// https://vitepress.dev/reference/site-config
export default withMermaid({
  lang: 'zh-CN',
  title: 'Plugin Light',
  description: '丰富易用的工具集',


  lastUpdated: true,
  cleanUrls: false,
  base: process.env.PUBLISH_PATH || '/plugin-light/',

  head: [
    ['link', { rel: 'icon', href: 'https://mike-1255355338.cos.ap-guangzhou.myqcloud.com/article/2023/8/own_mike_0d0107312bfd164de4.ico' }],
    ['meta', { name: 'author', content: 'novlan1' }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          '前端, notes, 笔记, Javascript, Typescript, React, Vue, webpack, vite, HTTP, 算法',
      },
    ],
    [
      'script',
      {
        src: 'https://tam.cdn-go.cn/aegis-sdk/latest/aegis.min.js',
      },
    ],
    [
      'script',
      {},
      `
      console.log('welcome docs by novlan1!');
      `,
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: '组件库',
        items: [
          {
            link: 'https://novlan1.github.io/docs/press-ui/',
            text: 'Press UI',
          },
          {
            link: 'https://novlan1.github.io/press-components/',
            text: 'Press Components',
          },
          {
            link: 'https://novlan1.github.io/docs/press-pix/',
            text: 'Press Pix',
          },
          {
            link: 'https://novlan1.github.io/press-plus/',
            text: 'Press Plus',
          },
          {
            link: 'https://novlan1.github.io/press-next/',
            text: 'Press Next',
          },
        ],
      },
      { text: 'T Comm', link: 'https://novlan1.github.io/docs/t-comm/' },
    ],

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
      label: '目录',
    },

    sidebar: [
      {
        text: '介绍',
        link: '/README.md',
      },
      {
        text: '贡献指南',
        link: '/CONTRIBUTING.md',
      },
      ...sidebarConfig.sidebar,
      SIDEBAR_WORK_DOCS,
      {
        text: '更新日志',
        collapsed: true,
        items: [
          ...sidebarChangelogConfig.sidebar,
          {
            text: 'plugin-light (deprecated)',
            link: '/CHANGELOG.md',
          },
        ],
      },
    ],

    socialLinks: [{ icon: 'git', link: 'https://github.com/novlan1/plugin-light/' }],

    footer: {
      message: getFooterMessage(),
      copyright: 'Copyright © 2021-present <span style="color: #0052d9;font-weight: 700;">novlan1</span>',
    },
  },
  ignoreDeadLinks: true,

  vite: {
    esbuild: {
      loader: 'tsx', // 支持 TS/TSX
    },
  },

  mermaid: {
    // 配置参考： https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults
  },
  // 可选地使用MermaidPluginConfig为插件本身设置额外的配置
  mermaidPlugin: {
    class: 'mermaid mermaid-my-class', // 为父容器设置额外的CSS类
  },
});
