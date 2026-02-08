# 转换 Web 标签

<p align="center">
  <img src="https://img.shields.io/npm/dw/@plugin-light/postcss-plugin-transform-web-tag">
  <img src="https://img.shields.io/npm/unpacked-size/@plugin-light/postcss-plugin-transform-web-tag">
  <img src="https://img.shields.io/npm/v/@plugin-light/postcss-plugin-transform-web-tag">
  <img src="https://img.shields.io/npm/l/@plugin-light/postcss-plugin-transform-web-tag">
  <img src="https://img.shields.io/github/last-commit/novlan1/plugin-light">
  <img src="https://img.shields.io/github/created-at/novlan1/plugin-light">
</p>

可转换样式文件中的 H5 标签，到小程序可识别的标签。

## 1. 作者

**novlan1**

## 2. 如何使用

安装

```bash
pnpm add @plugin-light/postcss-plugin-transform-web-tag -D
```

`vite.config.ts` 中新增配置：

```ts
import transformWebTag from '@plugin-light/postcss-plugin-transform-web-tag/lib/index';

export default {
  // ...
   css: {
    postcss: {
      plugins: [transformWebTag({
        tagMap: {
          span: 'label',
          img: 'image',
          i: 'view',
          p: 'view',
          h4: 'view',
          em: 'view',
          ul: 'view',
          li: 'view',
        }
      })],
    },
  },
  //...
}
```

## 3. 默认的 tagMap

```ts
const TAG_MAP = {
  span: 'label',
  img: 'image',
  i: 'view',
  p: 'view',
  h4: 'view',
  em: 'view',
  ul: 'view',
  li: 'view',
};
```

## 4. 更新日志

[点此查看](../changelog/postcss-plugin-transform-web-tag.md)
