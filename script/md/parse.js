// 处理从腾讯文档复制粘贴的原始思维导图数据，转换为 markdown 格式

const path = require('path');

const { readFileSync, writeFileSync } = require('t-comm');


function main() {
  const inputText = readFileSync(path.resolve(__dirname, './raw.md'));

  if (!inputText.trim()) {
    throw new Error('请输入要转换的文本');
  }
  const lines = inputText.split('\n');
  let outputText = '';

  // 初始化计数器数组
  const counters = [];
  let lastLevel = -1;

  lines.forEach((line) => {
    // 计算缩进层级（每个制表符代表一级）
    const indentLevel = line.match(/^\t*/)[0].length;
    const content = line.trim();

    if (!content) return;

    // 如果层级比上一次深，初始化新层级的计数器
    if (indentLevel > lastLevel) {
      for (let i = lastLevel + 1; i <= indentLevel; i++) {
        counters[i] = 0;
      }
    // 如果层级比上一次浅，重置更深层级的计数器
    } else if (indentLevel < lastLevel) {
      for (let i = indentLevel + 1; i < counters.length; i++) {
        counters[i] = 0;
      }
    }

    // 增加当前层级的计数器
    counters[indentLevel] = (counters[indentLevel] || 0) + 1;

    // 生成编号
    let number = '';
    for (let i = 0; i <= indentLevel; i++) {
      if (i === 0) {
        number += counters[i];
      } else {
        number += `.${counters[i]}`;
      }
    }

    // 添加缩进

    if (indentLevel >= 1) {
      const indent = '    '.repeat(indentLevel);
      outputText += `${indent}- ${content}\n`;
    } else {
      const indent = '  '.repeat(indentLevel);
      outputText += `${indent}${number}. ${content}\n`;
    }

    lastLevel = indentLevel;
  });
  writeFileSync(path.resolve(__dirname, './parsed.md'), outputText);
}


main();
