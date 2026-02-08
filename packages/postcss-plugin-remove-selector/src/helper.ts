import type { FileConfig, ShouldRemoveRuleOptions } from './types';

/**
 * 判断是否应该处理该文件
 * @param configList 配置列表
 * @param current 当前文件路径
 */
export function shouldHandleFile(configList: FileConfig[] = [], current: string): FileConfig | undefined {
  return configList.find((item) => {
    const { file } = item;
    if (typeof file === 'string') {
      return current.includes(file);
    }
    return file.test(current);
  });
}

/**
 * 从选择器中提取图标名称
 * @param selector 选择器，如 .t-icon-home:before
 * @returns 图标名称，如 home
 */
export function extractIconName(selector: string): string | null {
  const match = selector.match(/\.t-icon-([\w-]+):before/);
  return match ? match[1] : null;
}

/**
 * 判断是否应该移除该规则
 * @param options 配置项
 */
export function shouldRemoveRule(options: ShouldRemoveRuleOptions): boolean {
  const { selectorPattern, include, exclude, selector } = options;

  // 如果配置了 selectorPattern，只处理匹配的选择器
  if (selectorPattern && !selectorPattern.test(selector)) {
    return false;
  }

  // 提取图标名称进行精确匹配
  const iconName = extractIconName(selector);

  // 如果有 include 列表，只保留 include 中的图标
  if (include.length) {
    return !include.includes(iconName || '');
  }
  // 如果有 exclude 列表，移除 exclude 中的图标
  if (exclude.length) {
    return exclude.includes(iconName || '');
  }
  return false;
}
