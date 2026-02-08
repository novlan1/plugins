export type IDispatchScriptOptions = {
  // 移动的脚本被放在分包统一的目录下，dispatchDir 为目录名称
  // 不传的话，会使用随机值
  dispatchDir?: string;

  // 禁止移动的名单列表
  blackList?: Array<string | RegExp>;

  // 强制移动的名单列表，应保证没有子依赖在主包或其他分包中中
  whiteList?: Array<string | RegExp>;

  // 存储最近多少次的日志，默认 10
  maxLogNumber?: number;

  // vendor.js 的名称，默认 vendor-1.js
  vendorName?: string;
};


export type PagesJson = {
  pages?: Array<{ path: string }>;
  subPackages: Array<{ root: string; pages: Array<{ path: string }>}>
};

export type Bundle = any;


export type IterativeMap = Record<string, {
  parsedId?: string;
  dynamic: string[];
  importers: string[];
}>;
