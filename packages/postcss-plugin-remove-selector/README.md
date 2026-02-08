# 移除选择器

<p align="center">
  <img src="https://img.shields.io/npm/dw/@novlan/postcss-plugin-remove-selector">
  <img src="https://img.shields.io/npm/unpacked-size/@novlan/postcss-plugin-remove-selector">
  <img src="https://img.shields.io/npm/v/@novlan/postcss-plugin-remove-selector">
  <img src="https://img.shields.io/npm/l/@novlan/postcss-plugin-remove-selector">
  <img src="https://img.shields.io/github/last-commit/novlan1/plugins">
  <img src="https://img.shields.io/github/created-at/novlan1/plugins">
</p>

可用于移除三方库中的不需要的样式，从而减小包体积。

## 1. 作者

**novlan1**

## 2. 如何使用

安装

```bash
pnpm add @novlan/postcss-plugin-remove-selector -D
```

在 `vite.config.ts` 中使用：

```ts
import { defineConfig } from 'vite';
import { postCssPluginRemoveSelector } from '@novlan/postcss-plugin-remove-selector';
import {
  TDESIGN_ICON_REMOVE_SELECTOR
} from '@novlan/postcss-plugin-remove-selector/lib/tdesign-uniapp-icon';


export default defineConfig({
  css: {
    postcss: {
      plugins: [postCssPluginRemoveSelector(TDESIGN_ICON_REMOVE_SELECTOR)],
    },
  },
});
```

## 3. 类型

### Options

| 属性 | 类型 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| `list` | `FileConfig[]` | 是 | 配置列表 |
| `debug` | `boolean` | 否 | 是否开启调试模式 |

### FileConfig

| 属性 | 类型 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| `file` | `RegExp \| string` | 是 | 文件匹配规则，可以是字符串或正则表达式 |
| `include` | `string[]` | 否 | 需要保留的选择器列表（图标名称） |
| `exclude` | `string[]` | 否 | 需要移除的选择器列表（图标名称） |
| `selectorPattern` | `RegExp` | 否 | 选择器匹配模式，只处理匹配该模式的选择器 |

## 4. 更新日志

[点此查看](./CHANGELOG.md)

## 5. 效果

使用此插件，可使小程序大小减少`15KB`。

<img src="https://mike-1255355338.cos.ap-guangzhou.myqcloud.com/article/2025/3/own_mike_5110452c29f3a22c3a.png" width="600">

<img src="https://mike-1255355338.cos.ap-guangzhou.myqcloud.com/article/2025/3/own_mike_d5703094c04270a6d5.png" width="600">
