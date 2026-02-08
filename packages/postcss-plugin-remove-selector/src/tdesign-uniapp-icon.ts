/**
 * TDesign UniApp 图标减包配置
 *
 * 使用说明：
 * 1. 在 USED_ICONS 数组中配置项目中实际使用的图标名称
 * 2. 插件只会处理 .t-icon-xxx:before 这类图标选择器
 * 3. 其他基础样式（如 @font-face、.t-icon 等）会自动保留
 *
 * 如何查找项目中使用的图标：
 * grep -rho 'icon="[^"]*"\|left-icon="[^"]*"\|name="[^"]*"' src --include="*.vue" | sort | uniq
 */

/**
 * 项目中实际使用的图标列表
 * 根据 src 目录下的 .vue 文件分析得出
 */
const USED_ICONS = [
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
 * TDesign UniApp 图标减包配置
 */
export const TDESIGN_ICON_REMOVE_SELECTOR = {
  list: [
    {
      // 匹配 @tdesign/uniapp 的图标 css 文件
      file: /[@/]tdesign[/]uniapp[/]dist[/]icon[/]icon\.[css|vue]/,
      // 只处理 .t-icon-xxx:before 这类图标选择器，其他样式自动保留
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
      // 保留的图标名称列表
      include: USED_ICONS,
      exclude: [],
    },
  ],
};

