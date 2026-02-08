import type { Preset, PresetMode } from './types';

const TDESIGN_USED_ICONS = [
  // custom-tab-bar.vue
  'home',
  'chat',
  'user',

  // home/index.vue
  'add',

  // release/index.vue
  'location',
  'file-copy',
  'upload',

  // search/index.vue
  'search',
  'delete',

  // data-center/index.vue
  'info-circle-filled',

  // my/index.vue - 静态图标
  'discount',
  'edit',
  // my/index.vue - gridList 动态图标
  'root-list',
  // my/index.vue - settingList 动态图标
  'service',
  'setting',

  // setting/index.vue - menuData 动态图标
  'app',
  'notification',
  'image',
  'chart',
  'sound',
  'secured',
  'info-circle',

  // login/login.vue
  'logo-wechat-stroke',
  'logo-qq',
  'logo-wecom',
  'caret-down-small',

  // nav-bar.vue
  'view-list',

  // 组件内部可能使用的图标（如 t-navbar left-arrow 等）
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'chevron-down',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'arrow-down',
  'close',
  'close-circle-filled',
  'check',
  'check-circle-filled',
  'error-circle-filled',
  'loading',
];


/**
 * 内置预设配置
 *
 * 每个预设包含默认的 file 和 selectorPattern，
 * 用户只需提供 include/exclude 即可快速使用
 */
export const PRESETS: Record<PresetMode, Preset> = {
  tdesign: {
    /** 匹配 @tdesign/uniapp 的图标 css 文件 */
    file: /[@/]tdesign[/]uniapp[/]dist[/]icon[/]icon\.[css|vue]/,
    /** 只处理 .t-icon-xxx:before 这类图标选择器 */
    selectorPattern: /^\.t-icon-[\w-]+:before$/,
    // 保留的图标名称列表
    used: TDESIGN_USED_ICONS,
  },
};
