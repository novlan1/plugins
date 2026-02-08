import { PRESETS } from './presets';
/**
 * TDesign UniApp 图标减包配置
 *
 * 使用说明：
 * 1. 在 TDESIGN_USED_ICONS 数组中配置项目中实际使用的图标名称
 * 2. 插件只会处理 .t-icon-xxx:before 这类图标选择器
 * 3. 其他基础样式（如 @font-face、.t-icon 等）会自动保留
 *
 * 如何查找项目中使用的图标：
 * grep -rho 'icon="[^"]*"\|left-icon="[^"]*"\|name="[^"]*"' src --include="*.vue" | sort | uniq
 */


/**
 * TDesign UniApp 图标减包配置
 */
export const TDESIGN_ICON_REMOVE_SELECTOR = {
  list: [
    {
      // 匹配 @tdesign/uniapp 的图标 css 文件
      file: PRESETS.tdesign.file,
      // 只处理 .t-icon-xxx:before 这类图标选择器，其他样式自动保留
      selectorPattern: PRESETS.tdesign.selectorPattern,
      // 保留的图标名称列表
      used: PRESETS.tdesign.used,
    },
  ],
};

