export type IDispatchVueOptions = {
  // 组件被多少个分包使用才会移动，默认 1
  limit?: number;

  // 移动的组件被放在分包统一的目录下，dispatchDir 为目录名称
  // 不传的话，会使用随机值
  dispatchDir?: string;

  // 禁止移动的名单列表
  blackList?: Array<string | RegExp>;

  // 存储最近多少次的日志，默认 10
  maxLogNumber?: number;
};


export type Bundle = any;
export type BaseComponentMap = Record<string, string>;
export type ComponentMap = Record<string, Record<string, string>>;
export type ComponentMapList = Record<string, string[]>;

export type IReplacedComponentRefMap = Record<string, Array<Record<string, string>>>;
