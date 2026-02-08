<!-- 复制到 docs时，去掉“详细文档”，链接替换: zh/ => zh/ -->
<!-- find ./packages -type d -name "webpack-plugin-*"  | wc -l  -->
<!-- ls -d zh/*/ | wc -l -->
<!-- ls -d docs/work/* | wc -l -->
# Plugin Light

`Plugin Light` 是一个丰富、易用的工具集。

包含一些 `Webpack` 相关插件（25+），比如

- [依赖分析 (webpack-plugin-analyze-deps)](./zh/webpack-plugin-analyze-deps/)
- [脚本分发 (webpack-plugin-dispatch-script)](./zh/webpack-plugin-dispatch-script/)
- [组件分发 (webpack-plugin-dispatch-vue)](./zh/webpack-plugin-dispatch-vue/)
- [三方库打包修复 (webpack-plugin-fix-npm-package)](./zh/webpack-plugin-fix-npm-package/)
- ...

一些 `Webpack Loader`（20+）

- [条件编译 (webpack-loader-ifdef)](./zh/webpack-loader-ifdef/)
- [插入全局组件 (webpack-loader-insert-global-comp)](./zh/webpack-loader-insert-global-comp/)
- [三方库转换 (webpack-loader-replace-library)](./zh/webpack-loader-replace-library/)
- [转换 `v-lazy` (webpack-loader-v-lazy)](./zh/webpack-loader-v-lazy/)
- ...

一些 `Vite Plugin`（28+）

- [样式关键词编译 (vite-plugin-cross-game-style)](./zh/vite-plugin-cross-game-style/)
- [跨平台关键词编译 (vite-plugin-cross-platform)](./zh/vite-plugin-cross-platform/)
- [条件编译 (vite-plugin-ifdef)](./zh/vite-plugin-ifdef/)
- [版本输出 (vite-plugin-gen-version)](./zh/vite-plugin-gen-version/)
- ...

一些项目基础配置

- [非 uni-app Vue2 项目配置 (project-config-vue)](./zh/project-config-vue/)
- [非 uni-app Vue3 项目配置 (project-config-vite)](./zh/project-config-vite/)
- [uni-app Vue2 项目配置 (project-config-uni-vue)](./zh/project-config-uni-vue/)
- [uni-app Vue3 项目配置 (project-config-uni-vite)](./zh/project-config-uni-vite/)

| 类型               | 命名                                                                | 数量 |
| ------------------ | ------------------------------------------------------------------- | ---- |
| 项目配置           | `project-config-*`                                                  | 5    |
| 底层依赖           | `plugin-light-*`, `import-meta-resolve`, <br/>`uni-read-pages-vite` | 7    |
| 运行时工具         | `ebus-light`, `share-light`, `vconsole-helper`                      | 3    |
| 脚手架             | `net-cli`                                                           | 1    |
| ESLint 共享配置    | `eslint-config-*`                                                   | 3    |
| ESLint 插件        | `eslint-plugin-*`                                                   | 1    |
| Stylelint 共享配置 | `stylelint-config-*`                                                    | 1    |
| Stylelint 插件     | `stylelint-plugin-*`                                                    | 1    |
| Vite 插件          | `vite-plugin-*`                                                     | 28   |
| Webpack 插件       | `webpack-plugin-*`                                                  | 25   |
| Webpack Loader     | `webpack-loader-*`                                                  | 20   |
| Postcss 插件       | `postcss-plugin-*`                                                  | 2    |
| PixUI 工具         | `pixui-*`                                                           | 3    |
| 服务端脚本  |  `next-admin-svr`    | 1    |
| MCP 服务  |  `*-mcp`    | 3    |

当前子包共有 `104` 个。

## 安装

每个包名称不同，下面是一个示例：

```bash
npm install -D @plugin-light/project-config-vite
```

## 插件使用示例

```js
// vue.config.js

const { DispatchScriptPlugin } = require('@plugin-light/webpack-plugin-dispatch-vue');

let plugins = []

if (process.env.NODE_ENV === 'production') {
  // js分发
  plugins.push(new DispatchScriptPlugin());
}

module.exports = {
  configureWebpack: {
    plugins,
  }
}
```

`Webpack Plugin`、`Vite Plugin`、`Project Config` 均可以采用这种引入方式。

## Loader 使用示例

每个 `Webpack Loader` 都会导出 `LOADER` 和 `LOADER_PROD` 两个变量，分别对应 `loader.js`、`loader.prod.js` 的文件路径。

业务可以像下面这样使用：

```js
// vue.config.js

const { LOADER: ifdef } = require('@plugin-light/webpack-loader-ifdef');

module.export = {
  chainWebpack(config) {
    config.module
      .rule('ifdef-loader')
      // 根据项目实际配置文件类型
      .test(/press-ui.*(\.vue|\.ts|\.js|\.css|\.scss)$/)
      // 不要配成下面这样，会卡住
      // .test(/\.vue|\.ts|\.js|\.css|\.scss$/) 
      .use(ifdef)
      .loader(ifdef)
      .options({
        context: { H5: true },
        type: ['css', 'js', 'html'],
      })
      .end();
  }
}
```
