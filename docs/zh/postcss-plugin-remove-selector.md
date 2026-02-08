# 移除选择器

<p align="center">
  <img src="https://img.shields.io/npm/dw/@plugin-light/postcss-plugin-remove-selector">
  <img src="https://img.shields.io/npm/unpacked-size/@plugin-light/postcss-plugin-remove-selector">
  <img src="https://img.shields.io/npm/v/@plugin-light/postcss-plugin-remove-selector">
  <img src="https://img.shields.io/npm/l/@plugin-light/postcss-plugin-remove-selector">
  <img src="https://img.shields.io/github/last-commit/novlan1/plugin-light">
  <img src="https://img.shields.io/github/created-at/novlan1/plugin-light">
</p>

可用于移除三方库中的不需要的样式，从而减小包体积。

## 1. 作者

**novlan1**

## 2. 如何使用

安装

```bash
pnpm add @plugin-light/postcss-plugin-remove-selector -D
```

`postcss.config.js` 中新增配置：

```ts
module.exports = {
  require('@plugin-light/postcss-plugin-remove-selector/lib/index')({
    list: [{
      file: new RegExp('press-ui/press-icon-plus/css/icon.scss'),
      include: [
        'arrow',
        'arrow-left',
        'arrow-right',
        'arrow-up',
        'arrow-down',
        'success',
        'cross',
        'plus',
        'minus',
        'fail',
        'circle',
      ].map(item => `.press-icon-plus-${item}:before`),
    }],
  }),
}
```

也可以在 `vite.config.ts` 中使用：

```ts
import { defineConfig } from 'vite';
import removeSelector from '@plugin-light/postcss-plugin-remove-selector';
import {
  PRESS_ICON_PLUS_REMOVE_SELECTOR 
} from '@plugin-light/postcss-plugin-remove-selector/lib/press-ui-icon-plus';


export default defineConfig({
  css: {
    postcss: {
      plugins: [removeSelector(PRESS_ICON_PLUS_REMOVE_SELECTOR)],
    },
  },
});
```

## 3. 类型

```ts
interface Options {
  list: Array<{
    file: RegExp | string;
    exclude?: string[];
    include?: string[];
  }>;
}
```

## 4. 更新日志

[点此查看](../changelog/postcss-plugin-remove-selector.md)

## 5. 效果

使用此插件，可使小程序大小减少`15KB`。

<img src="https://mike-1255355338.cos.ap-guangzhou.myqcloud.com/article/2025/3/own_mike_5110452c29f3a22c3a.png" width="600">

<img src="https://mike-1255355338.cos.ap-guangzhou.myqcloud.com/article/2025/3/own_mike_d5703094c04270a6d5.png" width="600">
