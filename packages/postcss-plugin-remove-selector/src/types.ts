/**
 * 单个文件匹配配置
 */
export interface FileConfig {
  /** 文件匹配规则，可以是字符串或正则表达式 */
  file: RegExp | string;
  /** 正在使用的选择器列表（图标名称），这些图标会被保留 */
  used?: string[];
  /** 未使用的选择器列表（图标名称），这些图标会被移除 */
  unused?: string[];
  /** 增量追加到 used 列表中的图标名称，不会覆盖已有的 used */
  customUsed?: string[];
  /** 增量追加到 unused 列表中的图标名称，不会覆盖已有的 unused */
  customUnused?: string[];
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
 * 预设模式名称
 */
export type PresetMode = 'tdesign';

/**
 * 预设配置，包含默认的 file 和 selectorPattern
 */
export interface Preset {
  /** 文件匹配规则 */
  file: RegExp | string;
  /** 选择器匹配模式 */
  selectorPattern: RegExp;
  /** 正在使用的选择器列表（图标名称），这些图标会被保留 */
  used?: string[];
  /** 未使用的选择器列表（图标名称），这些图标会被移除 */
  unused?: string[];
}

/**
 * 简化配置项（扁平化形式）
 * 适用于只需要配置单个文件场景，无需传递 list 数组
 */
export interface SimpleOptions {
  /** 预设模式，如 'tdesign'，设置后自动使用对应的 file 和 selectorPattern 默认值 */
  mode?: PresetMode;
  /** 文件匹配规则，可以是字符串或正则表达式。使用 mode 时可省略 */
  file?: RegExp | string;
  /** 正在使用的选择器列表（图标名称），这些图标会被保留 */
  used?: string[];
  /** 未使用的选择器列表（图标名称），这些图标会被移除 */
  unused?: string[];
  /** 增量追加到 used 列表中的图标名称，不会覆盖已有的 used（适用于在预设基础上额外新增） */
  customUsed?: string[];
  /** 增量追加到 unused 列表中的图标名称，不会覆盖已有的 unused（适用于在预设基础上额外新增） */
  customUnused?: string[];
  /** 选择器匹配模式，只处理匹配该模式的选择器。使用 mode 时可省略 */
  selectorPattern?: RegExp;
  /** 是否开启调试模式 */
  debug?: boolean;
}

/**
 * 判断是否移除规则的参数
 */
export interface ShouldRemoveRuleOptions {
  /** 选择器匹配模式 */
  selectorPattern?: RegExp;
  /** 正在使用的选择器列表，这些会被保留 */
  used: string[];
  /** 未使用的选择器列表，这些会被移除 */
  unused: string[];
  /** 当前选择器 */
  selector: string;
}

/**
 * PostCSS 兼容类型定义
 * 兼容 PostCSS 7 和 PostCSS 8，避免直接依赖 postcss 包的类型
 */

/** PostCSS Rule 节点（兼容 v7/v8） */
export interface PostCSSRule {
  selector: string;
  remove(): void;
}

/** PostCSS Root 节点（兼容 v7/v8） */
export interface PostCSSRoot {
  walkRules(callback: (rule: PostCSSRule) => void): void;
}

/** PostCSS Result 对象（兼容 v7/v8） */
export interface PostCSSResult {
  opts?: {
    from?: string;
  };
}

/** PostCSS 8 插件对象 */
export interface PostCSSPlugin {
  postcssPlugin: string;
  Once(root: PostCSSRoot, helpers: { result: PostCSSResult }): void;
}

/** PostCSS 插件创建函数（含 postcss 标记和 postcss7 兼容） */
export interface PluginCreator {
  (opts?: Options | SimpleOptions): PostCSSPlugin;
  postcss: true;
  postcss7?: (opts?: Options | SimpleOptions) => (root: PostCSSRoot, result: PostCSSResult) => void;
}


