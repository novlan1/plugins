import type { Root, Result } from 'postcss';

/**
 * 单个文件匹配配置
 */
export interface FileConfig {
  /** 文件匹配规则，可以是字符串或正则表达式 */
  file: RegExp | string;
  /** 需要保留的选择器列表（图标名称） */
  include?: string[];
  /** 需要移除的选择器列表（图标名称） */
  exclude?: string[];
  /** 选择器匹配模式，只处理匹配该模式的选择器 */
  selectorPattern?: RegExp;
}

/**
 * 插件配置项
 */
export interface Options {
  /** 配置列表 */
  list: FileConfig[];
  /** 是否开启调试模式 */
  debug?: boolean;
}

/**
 * 判断是否移除规则的参数
 */
export interface ShouldRemoveRuleOptions {
  /** 选择器匹配模式 */
  selectorPattern?: RegExp;
  /** 需要保留的选择器列表 */
  include: string[];
  /** 需要移除的选择器列表 */
  exclude: string[];
  /** 当前选择器 */
  selector: string;
}

/**
 * PostCSS 插件返回类型
 */
export interface PostCSSPlugin {
  postcssPlugin: string;
  Once(root: Root, helpers: { result: Result }): void;
}
