import { shouldHandleFile, shouldRemoveRule } from './helper';

import type { Options, PostCSSPlugin } from './types';

export type { Options, FileConfig, ShouldRemoveRuleOptions, PostCSSPlugin } from './types';
export { shouldHandleFile, shouldRemoveRule, extractIconName } from './helper';

/**
 * PostCSS 插件：移除指定的 CSS 选择器
 * 用于图标样式减包等场景
 *
 * @param opts 配置项
 * @returns PostCSS 插件
 */
export function postCssPluginRemoveSelector(opts: Options = { list: [] }): PostCSSPlugin & { postcss: true } {
  const { list = [], debug = false } = opts;

  const plugin: PostCSSPlugin & { postcss: true } = {
    postcssPlugin: 'postcss-plugin-remove-selector',
    postcss: true,
    Once(root, { result }) {
      const fileName = result.opts?.from || '';
      const found = shouldHandleFile(list, fileName);

      if (!found) {
        return;
      }

      const { exclude = [], include = [], selectorPattern } = found;
      if (debug) {
        console.log('[postcss-plugin-remove-selector] handling:', fileName);
      }

      let removedCount = 0;

      root.walkRules((rule) => {
        if (shouldRemoveRule({
          selectorPattern,
          exclude,
          include,
          selector: rule.selector,
        })) {
          rule.remove();
          removedCount += 1;
        }
      });

      if (debug) {
        console.log(`[postcss-plugin-remove-selector] removed ${removedCount} rules from:`, fileName);
      }
    },
  };

  return plugin;
}
