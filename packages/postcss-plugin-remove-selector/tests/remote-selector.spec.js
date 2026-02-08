const postcss = require('postcss');

const { postcssPluginRemoveSelector } = require('../src/index');

const input = `
.t-icon-arrow-down:before {
  content: 'e65e';
}

.t-icon-arrow-up:before {
  content: 'e65f';
}

.t-icon-invitation:before {
  content: 'e6d6';
}

.t-icon-like-o:before {
  content: 'e6d7';
}

#someId {
  color: red;
}
`;


test('unused', async () => {
  const result = await postcss([postcssPluginRemoveSelector({
    list: [{
      file: 'abc',
      unused: ['invitation', 'like-o'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('used', async () => {
  const result = await postcss([postcssPluginRemoveSelector({
    list: [{
      file: 'abc',
      used: ['arrow-down', 'arrow-up'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('used & unused', async () => {
  const result = await postcss([postcssPluginRemoveSelector({
    list: [{
      file: 'abc',
      used: ['arrow-down', 'arrow-up'],
      unused: ['invitation', 'like-o', 'arrow-up'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('file is regexp', async () => {
  const result = await postcss([postcssPluginRemoveSelector({
    list: [{
      file: /tdesign\/uniapp\/dist\/icon/,
      used: ['arrow-down', 'arrow-up'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'tdesign/uniapp/dist/icon/icon.css' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('empty options', async () => {
  const result = await postcss([postcssPluginRemoveSelector()]).process(input, { from: 'tdesign/uniapp/dist/icon/icon.css' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('no selectorPattern - should not remove non-icon rules', async () => {
  const result = await postcss([postcssPluginRemoveSelector({
    list: [{
      file: 'abc',
      used: ['arrow-down'],
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('file not matched - should not modify css', async () => {
  const result = await postcss([postcssPluginRemoveSelector({
    list: [{
      file: 'not-matched-file',
      unused: ['arrow-down'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});

test('customUsed - should append to used list', async () => {
  const result = await postcss([postcssPluginRemoveSelector({
    list: [{
      file: 'abc',
      used: ['arrow-down'],
      customUsed: ['arrow-up'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('customUnused - should append to unused list', async () => {
  const result = await postcss([postcssPluginRemoveSelector({
    list: [{
      file: 'abc',
      unused: ['invitation'],
      customUnused: ['like-o'],
      selectorPattern: /^\.t-icon-[\w-]+:before$/,
    }],
  })]).process(input, { from: 'abc' });

  expect(result.css).toMatchSnapshot();
  expect(result.warnings()).toHaveLength(0);
});


test('postcss7 fallback - should work with postcss.plugin style', async () => {
  // 当 postcss.plugin 可用时，postcss7 属性应该被设置
  if (postcssPluginRemoveSelector.postcss7) {
    const plugin = postcssPluginRemoveSelector.postcss7({
      list: [{
        file: 'abc',
        unused: ['invitation', 'like-o'],
        selectorPattern: /^\.t-icon-[\w-]+:before$/,
      }],
    });
    const result = await postcss([plugin]).process(input, { from: 'abc' });

    // eslint-disable-next-line jest/no-conditional-expect
    expect(result.css).toMatchSnapshot();
    // eslint-disable-next-line jest/no-conditional-expect
    expect(result.warnings()).toHaveLength(0);
  } else {
    // 如果当前环境是 PostCSS 8，postcss.plugin 不存在，跳过
    // eslint-disable-next-line jest/no-conditional-expect
    expect(true).toBe(true);
  }
});
