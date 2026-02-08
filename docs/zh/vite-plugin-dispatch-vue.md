# 组件分发

<p align="center">
  <img src="https://img.shields.io/npm/dw/@plugin-light/vite-plugin-dispatch-vue">
  <img src="https://img.shields.io/npm/unpacked-size/@plugin-light/vite-plugin-dispatch-vue">
  <img src="https://img.shields.io/npm/v/@plugin-light/vite-plugin-dispatch-vue">
  <img src="https://img.shields.io/npm/l/@plugin-light/vite-plugin-dispatch-vue">
  <img src="https://img.shields.io/github/last-commit/novlan1/plugin-light">
  <img src="https://img.shields.io/github/created-at/novlan1/plugin-light">
</p>

同 Webpack 版本的组件分发插件。

## 1. 作者

**novlan1**

## 2. 如何使用

安装

```bash
pnpm add @plugin-light/vite-plugin-dispatch-vue -D
```

在 `vite.config.ts` 中添加如下设置：


```ts
import { defineConfig } from 'vite';
import { dispatchVueVitePlugin } from '@plugin-light/vite-plugin-dispatch-vue';


export default defineConfig({
  plugins: [
    dispatchVueVitePlugin({
      limit: 1,
    })
  ],
});
```

## 3. 参数

```ts
export type IDispatchVueOptions = {
  // 组件被多少个分包使用才会移动，默认 1
  limit?: number;

  // 移动的组件被放在分包统一的目录下，dispatchDir 为目录名称
  // 不传的话，会使用随机值
  dispatchDir?: string;

  // 禁止移动的名单列表
  blackList?: Array<string | RegExp>;
};
```

## 4. 原理

[Vite 版本的组件分发插件](https://juejin.cn/post/7439938405918244891)

## 5. 更新日志

[点此查看](../changelog/vite-plugin-dispatch-vue.md)
