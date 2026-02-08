import os from 'node:os';
import path from 'node:path';

import {
  decodeBase64Url,
  encodeBase64Url,
} from '@dcloudio/uni-cli-shared';


export const ENTRY = 'main.ts';
export const APP_VUE = 'App.vue';

export function slash(p: string): string {
  return p.replace(/\\/g, '/');
}

export const IS_WINDOWS = os.platform() === 'win32';
export const CHUNK_FILE_NAME_BLACK_LIST = ['main', 'pages.json', 'manifest.json'];
export const MAIN = 'MAIN';


const cssLangs = '\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)';
export const cssLangRE = new RegExp(cssLangs);
const directRequestRE = /(\?|&)direct\b/;


const uniPagePrefix = 'uniPage://';
const uniComponentPrefix = 'uniComponent://';

export function virtualPagePath(filepath: string) {
  return uniPagePrefix + encodeBase64Url(filepath);
}
export function virtualComponentPath(filepath: string) {
  return uniComponentPrefix + encodeBase64Url(filepath);
}

export function parseVirtualPagePath(uniPageUrl: string) {
  return decodeBase64Url(uniPageUrl.replace(uniPagePrefix, ''));
}

export function parseVirtualComponentPath(uniComponentUrl: string) {
  return decodeBase64Url(uniComponentUrl.replace(uniComponentPrefix, ''));
}

export function isUniPageUrl(id: string) {
  return id.startsWith(uniPagePrefix);
}

export function isUniComponentUrl(id: string) {
  return id.startsWith(uniComponentPrefix);
}


export const isCSSRequest = (request: string): boolean => cssLangRE.test(request) && !directRequestRE.test(request);


export const KNOWN_ASSET_TYPES = [
  // images
  'png',
  'jpe?g',
  'gif',
  'svg',
  'ico',
  'webp',
  'avif',

  // media
  'mp4',
  'webm',
  'ogg',
  'mp3',
  'wav',
  'flac',
  'aac',

  // fonts
  'woff2?',
  'eot',
  'ttf',
  'otf',

  // other
  'pdf',
  'txt',
];

export const DEFAULT_ASSETS_RE = new RegExp(`\\.(${KNOWN_ASSET_TYPES.join('|')})(\\?.*)?$`);
export const EXTNAME_JS_RE = /\.(js|jsx|ts|uts|tsx|mjs)$/;
export function removeExt(str: string) {
  return str.split('?')[0].replace(/\.\w+$/g, '');
}

export function isVueJs(id: string) {
  return id.includes('\0plugin-vue:export-helper');
}

export function normalizePath(id: string): string {
  return path.posix.normalize(IS_WINDOWS ? slash(id) : id);
}

export const PAGES_JSON_JS = '/pages-json-js';


export const ANALYZE_BLACK_LIST = [
  'node_modules/vuex',
  'node_modules/@vue',
  'node_modules/@dcloudio',
  'node_modules/@dcloudio',
  '?vue&type=style',
  'pages-json-js',
  '/node_modules/lodash-es',
  '/node_modules/@babel',
];


