import { shouldHandleFile, shouldRemoveRule } from './helper';
import { PRESETS } from './presets';

import type { Options, SimpleOptions, PostCSSRoot, PostCSSResult, PostCSSRule, PluginCreator } from './types';

export type { Options, SimpleOptions, FileConfig, ShouldRemoveRuleOptions, PresetMode, Preset, PostCSSRoot, PostCSSResult, PostCSSRule, PostCSSPlugin, PluginCreator } from './types';
export { shouldHandleFile, shouldRemoveRule, extractIconName } from './helper';

const PLUGIN_NAME = 'postcss-plugin-remove-selector';

/**
 * 判断传入的配置是否为简化模式
 */
function isSimpleOptions(opts: Options | SimpleOptions): opts is SimpleOptions {
  return !('list' in opts);
}

/**
 * 将简化配置转换为标准 Options
 */
function normalizeOptions(opts: Options | SimpleOptions): Options {
  if (!isSimpleOptions(opts)) {
    return opts;
  }

  const { mode, file, used, unused, customUsed, customUnused, selectorPattern, debug } = opts;

  let resolvedFile = file;
  let resolvedSelectorPattern = selectorPattern;
  let resolvedUsed = used || [];
  let resolvedUnused = unused || [];

  // 如果指定了 mode，使用预设的默认值
  if (mode && PRESETS[mode]) {
    const preset = PRESETS[mode];
    if (!resolvedFile) {
      resolvedFile = preset.file;
    }
    if (!resolvedSelectorPattern) {
      resolvedSelectorPattern = preset.selectorPattern;
    }
    // 如果用户没有显式指定 used/unused，使用预设的默认值
    if (!used && preset.used) {
      resolvedUsed = [...preset.used];
    }
    if (!unused && preset.unused) {
      resolvedUnused = [...preset.unused];
    }
  }

  // 将 customUsed/customUnused 增量追加（不覆盖）
  if (customUsed?.length) {
    resolvedUsed = [...resolvedUsed, ...customUsed];
  }
  if (customUnused?.length) {
    resolvedUnused = [...resolvedUnused, ...customUnused];
  }

  if (!resolvedFile) {
    throw new Error(`[${PLUGIN_NAME}] 必须指定 "file" 或 "mode"，当前均未设置。`);
  }

  return {
    list: [
      {
        file: resolvedFile,
        used: resolvedUsed,
        unused: resolvedUnused,
        selectorPattern: resolvedSelectorPattern,
      },
    ],
    debug,
  };
}

/**
 * 核心处理逻辑，PostCSS 7 / 8 共用
 */
function processRoot(root: PostCSSRoot, result: PostCSSResult, opts: Options) {
  const { list = [], debug = false } = opts;
  const fileName = result.opts?.from || '';
  const found = shouldHandleFile(list, fileName);

  if (!found) {
    return;
  }

  const { used = [], unused = [], customUsed = [], customUnused = [], selectorPattern } = found;

  // 合并 customUsed/customUnused 到 used/unused
  const mergedUsed = customUsed.length ? [...used, ...customUsed] : used;
  const mergedUnused = customUnused.length ? [...unused, ...customUnused] : unused;

  if (debug) {
    console.log('[postcss-plugin-remove-selector] handling:', fileName);
  }

  let removedCount = 0;

  root.walkRules((rule: PostCSSRule) => {
    if (shouldRemoveRule({
      selectorPattern,
      used: mergedUsed,
      unused: mergedUnused,
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
 * 支持两种配置方式：
 * 1. 标准模式：传入 { list: [...], debug?: boolean }
 * 2. 简化模式：传入 { mode?, file?, used?, unused?, customUsed?, customUnused?, selectorPattern?, debug? }
 *
 * @param opts 配置项
 * @returns PostCSS 插件
 */
const postcssPluginRemoveSelector: PluginCreator = (opts: Options | SimpleOptions = { list: [] }) => {
  const normalizedOpts = normalizeOptions(opts);
  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root: PostCSSRoot, { result }: { result: PostCSSResult }) {
      processRoot(root, result, normalizedOpts);
    },
  };
};

// 标记为 PostCSS 8 插件
postcssPluginRemoveSelector.postcss = true as const;

// PostCSS 7 兼容：通过 postcss.plugin() 注册
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const postcss = require('postcss');
  if (postcss && typeof postcss.plugin === 'function') {
    postcssPluginRemoveSelector.postcss7 = postcss.plugin(
      PLUGIN_NAME,
      (opts: Options | SimpleOptions = { list: [] }) => (root: PostCSSRoot, result: PostCSSResult) => {
        const normalizedOpts = normalizeOptions(opts);
        processRoot(root, result, normalizedOpts);
      },
    );
  }
} catch {
  // postcss 未安装或不支持 postcss.plugin，忽略
}

export { postcssPluginRemoveSelector };
