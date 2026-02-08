import { h } from 'vue';

import { Watermark } from 'press-tdesign-vue-next';
import { useRoute } from 'vitepress';
import imageViewer from 'vitepress-plugin-image-viewer';
import DefaultTheme from 'vitepress/theme';

import 'viewerjs/dist/viewer.min.css';
import './custom.css';


export default {
  ...DefaultTheme,
  extends: DefaultTheme,
  setup() {
    imageViewer(useRoute());
  },
  Layout: () => h(Watermark, () => h(DefaultTheme.Layout)),

};
