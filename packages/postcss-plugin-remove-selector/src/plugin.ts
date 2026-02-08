import { shouldHandleFile, shouldRemoveRule } from './helper';

import type { Options } from './types';

export type { Options, FileConfig, ShouldRemoveRuleOptions } from './types';
export { shouldHandleFile, shouldRemoveRule, extractIconName } from './helper';

const PLUGIN_NAME = 'postcss-plugin-remove-selector';

/**
 * 核心处理逻辑，PostCSS 7 / 8 共用
 */
function processRoot(root: any, result: any, opts: Options) {
  const { list = [], debug = false } = opts;
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

  root.walkRules((rule: any) => {
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
}

/**
 * PostCSS 插件：移除指定的 CSS 选择器
 * 用于图标样式减包等场景
 *
 * 同时兼容 PostCSS 7 和 PostCSS 8：
 * - PostCSS 8：使用标准 Creator 函数格式 + postcss: true 标记
 * - PostCSS 7：回退到 postcss.plugin() 注册方式
 *
 * @param opts 配置项
 * @returns PostCSS 插件
 */
const postCssPluginRemoveSelector: any = (opts: Options = { list: [] }) =>
  // PostCSS 8 格式
  ({
    postcssPlugin: PLUGIN_NAME,
    Once(root: any, { result }: any) {
      processRoot(root, result, opts);
    },
  })
;

// 标记为 PostCSS 8 插件
postCssPluginRemoveSelector.postcss = true as const;

// PostCSS 7 兼容：通过 postcss.plugin() 注册
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const postcss = require('postcss');
  if (postcss && typeof postcss.plugin === 'function') {
    postCssPluginRemoveSelector.postcss7 = postcss.plugin(
      PLUGIN_NAME,
      (opts: Options = { list: [] }) => (root: any, result: any) => {
        processRoot(root, result, opts);
      },
    );
  }
} catch (e) {
  // postcss 未安装或不支持 postcss.plugin，忽略
}

export { postCssPluginRemoveSelector };
