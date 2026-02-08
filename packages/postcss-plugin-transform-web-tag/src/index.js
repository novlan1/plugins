/* eslint-disable @typescript-eslint/no-require-imports */
const selectorParser = require('postcss-selector-parser');

const {
  LOG_TYPE_MAP,
  PLUGIN_NAME,
  TAG_MAP,
} = require('./config');
const { getRepeatObj } = require('./helper');


function getPostcssVersion() {
  let version = 8;
  try {
    version = Number(require('postcss/package.json').version.split('.')[0]);
  } catch (err) {}
  return version;
}

const version = getPostcssVersion();


const transformSelector = (complexSelector, transformer) => selectorParser(transformer).processSync(complexSelector);


function once(options) {
  const { tagMap = TAG_MAP, logType = LOG_TYPE_MAP.repeat } = options || {};

  return function  (root)  {
    const found = [];
    const fileName = root.source?.input?.file || '';

    const repeatedList = [];
    root.walkRules((rule) => {
      // Transform each rule here
      // rule.selectors == comma seperated selectors
      // a, b.c {} => ["a", "b.c"]
      rule.selectors = rule.selectors.map((complexSelector) => {
        let replaced = false;

        // complexSelector => simpleSelectors
        // "a.b#c" => ["a", ".b", "#c"]
        const res = transformSelector(complexSelector, (simpleSelectors) => {
          simpleSelectors.walkTags((tag) => {
            if (tagMap[tag.value]) {
              found.push(tag.value);
              replaced = true;
              tag.value = tagMap[tag.value];
            }
          });
        });


        if (replaced) {
          repeatedList.push(complexSelector);
        }

        return res;
      });
    });


    if (repeatedList.length) {
      const repeatObj = getRepeatObj(repeatedList, tagMap);
      if (repeatObj && Object.keys(repeatObj).length && logType === LOG_TYPE_MAP.repeat) {
        console.log(`>>> Postcss Transform Web Tag Repeated in ${fileName}:`, repeatObj);
      }
    }
    if (found.length && logType === LOG_TYPE_MAP.all) {
      const fileName = root.source?.input?.file || '';
      console.log(`>>> Postcss Transform Web Tag: ${fileName} ${found.join(' ')}`);
    }
  };
}

if (version < 8) {
  const postcss = require('postcss');
  module.exports = postcss.plugin(PLUGIN_NAME, once);
} else {
  module.exports = function (options) {
    return {
      postcssPlugin: PLUGIN_NAME,
      Once: once(options),
    };
  };

  module.exports.postcss = true;
}
