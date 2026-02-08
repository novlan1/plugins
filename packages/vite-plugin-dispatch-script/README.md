# 脚本分发

<p align="center">
  <img src="https://img.shields.io/npm/dw/@plugin-light/vite-plugin-dispatch-script">
  <img src="https://img.shields.io/npm/unpacked-size/@plugin-light/vite-plugin-dispatch-script">
  <img src="https://img.shields.io/npm/v/@plugin-light/vite-plugin-dispatch-script">
  <img src="https://img.shields.io/npm/l/@plugin-light/vite-plugin-dispatch-script">
  <img src="https://img.shields.io/github/last-commit/novlan1/plugin-light">
  <img src="https://img.shields.io/github/created-at/novlan1/plugin-light">
</p>

同 Webpack 版本的脚本分发插件。

## 1. 作者

**novlan1**

## 2. 如何使用

安装

```bash
pnpm add @plugin-light/vite-plugin-dispatch-script -D
```

在 `vite.config.ts` 中添加如下设置：

```ts
import { defineConfig } from 'vite';
import { dispatchScriptVitePlugin } from '@plugin-light/vite-plugin-dispatch-script';


export default defineConfig({
  plugins: [
    dispatchScriptVitePlugin({
    })
  ],
});
```

## 3. 参数

```ts
export type IDispatchScriptOptions = {
  // 移动的脚本被放在分包统一的目录下，dispatchDir 为目录名称
  // 不传的话，会使用随机值
  dispatchDir?: string;

  // 禁止移动的名单列表
  blackList?: Array<string | RegExp>;

  // 强制移动的名单列表，应保证没有子依赖在主包或其他分包中中
  whiteList?: Array<string | RegExp>;
};
```

## 4. 常见问题

如果存在 JS/TS 文件引用 Vue 文件，会导致编译异常，这种本身就是不对的，Vue 文件只能被 Vue 文件引用，不能被 JS/TS 引用。

一个常见的错误场景是函数式调用组件，引入组件时，没有加条件编译。

## 5. 更新日志

[点此查看](./CHANGELOG.md)
